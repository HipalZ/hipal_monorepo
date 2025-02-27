import {
  BillUrlModel,
  Business,
  BusinessPosConfig,
  DuesUser,
  KotOrder,
  NpcUser,
  Order,
  Payment,
  PaymentAlert,
  PendingDues,
  QrBill,
  Table,
  TempTableSettle,
  UnsettleTable,
  UpiMode,
  User,
  UserSession,
} from "@hi/db-models";
import {
  type SwitchTableType,
  forceSettleSchema,
  normalSettleSchema,
  resolveTableSchema,
  switchTableschema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import type { ClientSession } from "mongodb";
import { nanoid } from "nanoid";
import { z } from "zod";
import { ubacMiddleware } from "../../../middleware/checkPermissions";
import { calculateCartBill } from "../../utils/helper";
import { generateTenDigitCode } from "../pos";
//
const tableRouter = new Hono()
  .get(
    "/all/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const tables = await Table.find({
        businessId,
        active: "1",
        status: "ACTIVE",
      }).populate({
        path: "userIds",
        select: "name phone",
      });

      return c.json(
        {
          message: "Tables fetched successfully",
          err: false,
          data: tables,
        },
        200,
      );
    },
  )
  .get(
    "/:tableId",
    zValidator(
      "param",
      z.object({
        tableId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { tableId } = c.req.param();

      const table = await Table.findById(tableId);

      return c.json(
        {
          message: "Tables fetched successfully",
          err: false,
          data: table,
        },
        200,
      );
    },
  )
  .get(
    "/empty_table/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const tables = await Table.find({
        businessId,
        status: "EMPTY",
        active: "1",
      });

      return c.json(
        {
          message: "Tables fetched successfully",
          err: false,
          data: tables,
        },
        200,
      );
    },
  )

  .get(
    "/orders/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const order = await KotOrder.find({
        businessId,
        settled: false,
        edited: false,
        rejected: false,
        accepted: false,
      });

      return c.json(
        {
          message: "Orders fetched successfully",
          err: false,
          data: order,
        },
        200,
      );
    },
  )
  .put(
    "/update_guest",
    zValidator(
      "json",
      z.object({
        tableId: z.string().min(1).max(500),
        guestCount: z.number().positive(),
      }),
    ),
    async (c) => {
      const { guestCount, tableId } = await c.req.json();

      const table = await Table.findByIdAndUpdate(
        tableId,
        {
          capacity: guestCount,
        },
        {
          new: true,
        },
      );

      return c.json(
        {
          message: "Table updated successfully",
          err: false,
          data: table,
        },
        200,
      );
    },
  )
  .post(
    "/force_settle",
    ubacMiddleware("force_settle"),
    zValidator("json", forceSettleSchema),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const {
          tableId,
          captainId,
          reasonForForceSettle,
          settleAmount = 0,
          billRequestId,
          settleModes,

          split = false,
          duesUserId,
          npcUserId,
        } = await c.req.json();

        if (!billRequestId) {
          return c.json(
            {
              message: "You must generate the bill for this table first.",
              err: true,
              data: {},
            },
            400,
          );
        }

        const paymentMode = await UpiMode.findById(settleModes[0]?._id);

        const billAlreadySettled = await Payment.findOne({
          posBillRequestId: billRequestId,
        });

        if (billAlreadySettled) {
          return c.json(
            {
              message: "Bill already settled",
              err: true,
              data: {},
            },
            409,
          );
        }

        const captain = await User.findById(captainId);
        const npcUser = await NpcUser.findById(npcUserId);

        const table = await Table.findById(tableId);

        const activeTable = await UserSession.findOne({
          businessId: table?.businessId,
          tableName: table?.name,
        });
        const pos = await BusinessPosConfig.findOne({
          businessId: table?.businessId,
        }).populate("posId");

        if (!pos) {
          return c.json(
            {
              message: "Pos not found",
              err: true,
            },
            400,
          );
        }

        await UserSession.findOneAndUpdate(
          {
            businessId: table?.businessId,
            transferTableFrom: table?._id.toString(),
          },
          {
            $set: {
              transferTableFrom: "",
            },
          },
          {
            session,
          },
        );

        await KotOrder.updateMany(
          {
            tableName: table?.name,
            settled: false,
            businessId: table?.businessId,
          },
          { $set: { settled: true } },
          { session },
        );
        const uniqueOrderId = nanoid(15);

        let modifyTotal = 0;
        if (
          paymentMode?.name === "npc" ||
          paymentMode?.name === "dues" ||
          paymentMode?.name === "complementary"
        ) {
          modifyTotal = 0;
        } else {
          modifyTotal = settleAmount;

          if (settleModes.length > 1) {
            for (const settle of settleModes) {
              if (settle.name === "complementary") {
                modifyTotal -= settle.amount ?? 0;
              }
            }
          }
        }
        const res = await axios.post(
          "http://api.petpooja.com/V1/captainorders/success_payment/",
          {
            app_key: pos?.posId.accessKey,
            app_secret: pos?.posId.secretKey,
            access_token: pos?.posId.authToken,
            restID: pos?.posId.restId,
            bill_request_id: activeTable?.billRequestId,
            amount_paid: modifyTotal,
            pin: activeTable?.pin,
          },
        );

        if (res.data.success === "0") {
          throw new Error("Payment failed at pos");
        }

        const saveOrder = await Order.create(
          [
            {
              total:
                paymentMode?.name === "npc" ||
                paymentMode?.name === "complementary"
                  ? 0
                  : settleAmount,
              currency: "INR",
              receipt: uniqueOrderId,
              userId: paymentMode?.name === "npc" ? npcUser?.userId : captainId,
              claimedCoins: activeTable?.claimedCoins || 0,
              tableName: table?.name,
              tips: activeTable?.tips || 0,
              billValue:
                paymentMode?.name === "npc" ||
                paymentMode?.name === "complementary"
                  ? settleAmount
                  : activeTable?.initialTotal || 0,
              businessId: table?.businessId,
              order_id: uniqueOrderId,

              date: Date.now(),
            },
          ],
          { session },
        );

        const createPayment = await Payment.create(
          [
            {
              businessId: table?.businessId,
              order_id: saveOrder[0]._id,
              total: saveOrder[0].total,
              mode: settleModes.length > 1 ? "split" : paymentMode?.name,
              status: "SUCCESS",
              paymentMode: settleModes.length > 1 ? "split" : paymentMode?.name,
              userId: paymentMode?.name === "npc" ? npcUser?.userId : captainId,
              claimedCoins: saveOrder[0].claimedCoins,
              billValue: saveOrder[0].billValue,
              tips: saveOrder[0].tips,
              tableName: saveOrder[0].tableName,
              earnCoins: 0,
              razorpayEventId: nanoid(15),
              razorpayOrderId: nanoid(15),
              razorpayPaymentId: nanoid(15),
              settleType: "FORCE_SETTLE",
              comment: reasonForForceSettle,
              posBillId: activeTable?.requestId,
              tax:
                paymentMode?.name === "npc" ||
                paymentMode?.name === "complementary"
                  ? 0
                  : activeTable?.finalTax,
              serviceCharge:
                paymentMode?.name === "npc" ||
                paymentMode?.name === "complementary"
                  ? 0
                  : activeTable?.serviceCharge,
              posBillRequestId: billRequestId,
              splitModes: settleModes,

              waiterName: captain?.name,
              date: Date.now(),
              discount: activeTable?.discount,
            },
          ],
          { session },
        );
        if (duesUserId && paymentMode?.name === "dues") {
          const createPaymentDues = await PendingDues.create(
            [
              {
                billId: createPayment[0]._id,
                businessId: saveOrder[0].businessId,
                date: Date.now(),
                duesUserId: duesUserId,
                isSettled: false,
              },
            ],
            {
              session,
            },
          );

          await DuesUser.findByIdAndUpdate(
            duesUserId,
            {
              $inc: {
                totalDuesAmount: saveOrder[0].total,
              },
            },
            { session },
          );
        }
        if (npcUserId && paymentMode?.name === "npc") {
          await NpcUser.findByIdAndUpdate(
            npcUserId,
            {
              $inc: {
                totalNpcAmount: saveOrder[0].total,
              },
            },
            { session },
          );
        }
        await Table.findByIdAndUpdate(
          tableId,
          {
            status: "EMPTY",
            capacity: 0,
            hiCode: "",
            currentTableAmount: 0,
            totalItemCount: 0,
            userIds: [],
            isTransfer: false,
            edited: false,
          },
          { session },
        );

        await TempTableSettle.create(
          [
            {
              businessId: table?.businessId,
              createdAt: Date.now(),
              tableName: table?.name,
              settleBy: captain?.name,
              hiCode: table?.hiCode,
            },
          ],
          { session },
        );

        await UserSession.deleteOne(
          {
            businessId: table?.businessId,
            tableName: table?.name,
          },
          { session },
        );
        await PaymentAlert.updateOne(
          {
            tableName: table?.name,
            isAccepted: false,
            alertType: "OFFLINE",
          },
          { isAccepted: true, isRejected: true },
          { session },
        );
        await PaymentAlert.create(
          [
            {
              businessId: saveOrder[0]?.businessId,
              alertType: "FORCE_SETTLE",
              payment_id: createPayment[0]._id,
              coinsApplied: !!(
                activeTable?.claimedCoins && activeTable?.claimedCoins > 0
              ),
              status: "SUCCESS",
              order_id: saveOrder[0]?._id,
              message: `Paid ${saveOrder[0]?.total}`,
              tableName: saveOrder[0]?.tableName,
              isAccepted: false,
              userId: saveOrder[0]?.userId,
              posDiscount: 0,
              date: Date.now(),
              mode: paymentMode?.name,
            },
          ],
          { session },
        );

        return c.json(
          {
            message: "Table settled successfully",
            err: false,
          },
          200,
        );
      });
    },
  )
  .post(
    "/normal_settle",
    ubacMiddleware("normal_settle"),
    zValidator("json", normalSettleSchema),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const {
          tableId,
          captainId,
          billRequestId,

          settleModes = [],
          split,
          duesUserId,
          npcUserId,
        } = await c.req.json();
        const paymentMode = await UpiMode.findById(settleModes[0]?._id);

        const billAlreadySettled = await Payment.findOne({
          posBillRequestId: billRequestId,
        });

        if (billAlreadySettled) {
          return c.json(
            {
              message: "Bill already settled",
              err: true,
              data: {},
            },
            409,
          );
        }

        const table = await Table.findById(tableId);

        if (!table) {
          return c.json(
            {
              message: "Table not found",
              err: true,
              data: {},
            },
            404,
          );
        }
        const findTable = await UserSession.findOne({
          businessId: table?.businessId,
          tableName: table?.name,
        });
        const captain = await User.findById(captainId);
        const pos = await BusinessPosConfig.findOne({
          businessId: table?.businessId,
        }).populate("posId");
        if (!pos) {
          return c.json(
            {
              message: "Pos not found",
              err: true,
            },
            400,
          );
        }

        const npcUser = await NpcUser.findById(npcUserId);

        await UserSession.findOneAndUpdate(
          {
            businessId: table?.businessId,
            transferTableFrom: table?._id.toString(),
          },
          {
            $set: {
              transferTableFrom: "",
            },
          },
          {
            session,
          },
        );

        await KotOrder.updateMany(
          {
            tableName: table?.name,
            settled: false,
            businessId: table?.businessId,
          },
          { $set: { settled: true } },
          { session },
        );

        const uniqueOrderId = nanoid(15);

        let modifyTotal = 0;
        if (
          paymentMode?.name === "npc" ||
          paymentMode?.name === "dues" ||
          paymentMode?.name === "complementary"
        ) {
          modifyTotal = 0;
        } else {
          modifyTotal = findTable?.finalTotal || 0;

          if (settleModes.length > 1) {
            for (const settle of settleModes) {
              if (settle.name === "complementary") {
                modifyTotal -= settle.amount ?? 0;
              }
            }
          }
        }

        const saveOrder = await Order.create(
          [
            {
              total:
                paymentMode?.name === "npc" ||
                paymentMode?.name === "complementary"
                  ? 0
                  : findTable?.finalTotal || 0,
              currency: "INR",
              receipt: uniqueOrderId,
              userId: paymentMode?.name === "npc" ? npcUser?.userId : captainId,
              claimedCoins: findTable?.claimedCoins || 0,
              tableName: table?.name,
              tips: findTable?.tips || 0,
              billValue: findTable?.initialTotal || 0,
              businessId: table?.businessId,
              order_id: uniqueOrderId,

              date: Date.now(),
            },
          ],
          { session },
        );

        const createPayment = await Payment.create(
          [
            {
              businessId: table?.businessId,
              order_id: saveOrder[0]._id,
              total: saveOrder[0].total,
              mode: settleModes.length > 1 ? "split" : paymentMode?.name,
              status: "SUCCESS",
              paymentMode: settleModes.length > 1 ? "split" : paymentMode?.name,
              userId: paymentMode?.name === "npc" ? npcUser?.userId : captainId,
              claimedCoins: saveOrder[0].claimedCoins,
              billValue: saveOrder[0].billValue,
              tips: saveOrder[0].tips,
              tableName: saveOrder[0].tableName,
              earnCoins: 0,
              razorpayEventId: nanoid(15),
              razorpayOrderId: nanoid(15),
              razorpayPaymentId: nanoid(15),
              settleType: "NORMAL_SETTLE",
              comment: "NORMAL SETTLE",

              posBillId: findTable?.requestId,
              tax:
                paymentMode?.name === "npc" ||
                paymentMode?.name === "complementary"
                  ? 0
                  : findTable?.finalTax,
              serviceCharge:
                paymentMode?.name === "npc" ||
                paymentMode?.name === "complementary"
                  ? 0
                  : findTable?.serviceCharge,
              posBillRequestId: billRequestId,
              waiterName: captain?.name,
              splitModes: settleModes,
              date: Date.now(),
              discount: findTable?.discount,
            },
          ],
          { session },
        );

        if (duesUserId && paymentMode?.name === "dues") {
          const createPaymentDues = await PendingDues.create(
            [
              {
                billId: createPayment[0]._id,
                businessId: saveOrder[0].businessId,
                date: Date.now(),
                duesUserId: duesUserId,
                isSettled: false,
              },
            ],
            {
              session,
            },
          );

          await DuesUser.findByIdAndUpdate(
            duesUserId,
            {
              $inc: {
                totalDuesAmount: saveOrder[0].total,
              },
            },
            { session },
          );
        }
        if (npcUserId && paymentMode?.name === "npc") {
          await NpcUser.findByIdAndUpdate(
            npcUserId,
            {
              $inc: {
                totalNpcAmount: saveOrder[0].billValue,
              },
            },
            { session },
          );
        }
        await Table.findByIdAndUpdate(
          tableId,
          {
            status: "EMPTY",
            capacity: 0,
            hiCode: "",
            currentTableAmount: 0,
            totalItemCount: 0,
            userIds: [],
            isTransfer: false,
            edited: false,
          },
          { session },
        );

        await TempTableSettle.create(
          [
            {
              businessId: table?.businessId,
              tableName: table?.name,
              settleBy: captain?.name,
              createdAt: Date.now(),
              hiCode: table?.hiCode,
            },
          ],
          { session },
        );

        const res = await axios.post(
          "http://api.petpooja.com/V1/captainorders/success_payment/",
          {
            app_key: pos?.posId.accessKey,
            app_secret: pos?.posId.secretKey,
            access_token: pos?.posId.authToken,
            restID: pos?.posId.restId,
            bill_request_id: billRequestId,
            amount_paid: modifyTotal,
            pin: findTable?.pin,
          },
        );

        if (res.data.success === "0") {
          throw new Error("Payment failed at pos");
        }

        await UserSession.deleteOne(
          {
            businessId: table?.businessId,
            tableName: table?.name,
          },
          { session },
        );
        await PaymentAlert.updateOne(
          {
            tableName: table?.name,
            isAccepted: false,
            alertType: "OFFLINE",
          },
          { isAccepted: true, isRejected: true },
          { session },
        );
        await PaymentAlert.create(
          [
            {
              businessId: saveOrder[0]?.businessId,
              alertType: "NORMAL_SETTLE",
              payment_id: createPayment[0]._id,
              coinsApplied: !!(
                findTable?.claimedCoins && findTable?.claimedCoins > 0
              ),
              status: "SUCCESS",
              order_id: saveOrder[0]?._id,
              message: `Paid ${saveOrder[0]?.total}`,
              tableName: saveOrder[0]?.tableName,
              isAccepted: false,
              userId: saveOrder[0]?.userId,
              posDiscount: 0,
              date: Date.now(),
              mode: paymentMode?.name,
            },
          ],
          { session },
        );

        return c.json(
          {
            message: "Table settled successfully",
            err: false,
          },
          200,
        );
      });
    },
  )
  .post(
    "/hi_settle",
    zValidator(
      "json",
      z.object({
        tableId: z.string().min(1).max(500),
        captainId: z.string().min(1).max(500),
        billRequestId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { tableId, captainId, billRequestId } = await c.req.json();

      const table = await Table.findById(tableId);

      const userSession = await UserSession.findOne({
        businessId: table?.businessId,
        tableName: table?.name,
      });

      const alreadySetlle = await Payment.findOne({
        posBillRequestId: billRequestId,
      });

      if (alreadySetlle) {
        return c.json(
          {
            message: "Bill already settled",
            err: true,
            data: {},
          },
          409,
        );
      }
      const updateTempTableStatus = await UserSession.findOneAndUpdate(
        {
          businessId: table?.businessId,
          tableName: table?.name,
        },
        {
          $set: {
            settleType: "HI_SETTLE",
          },
        },
      );

      const customLink = await Business.findById(table?.businessId);
      const captain = await User.findById(captainId);
      const pos = await BusinessPosConfig.findOne({
        businessId: table?.businessId,
      }).populate("posId");
      if (!pos) {
        return c.json(
          {
            message: "Pos not found",
            err: true,
          },
          400,
        );
      }

      const qrBill = await QrBill.findOne({
        requestBillId: billRequestId,
      });

      if (qrBill) {
        await QrBill.findOneAndUpdate(
          {
            requestBillId: billRequestId,
          },
          {
            $set: {
              captainId: captainId,
              date: Date.now(),
            },
          },
        );

        await qrBill.save();
        return c.json(
          {
            message: "fetched qr bill",
            err: false,
            data: {
              qrBillId: qrBill.requestBillId,
              expireIn: qrBill.expireIn,
              path: `https://hipal-test.hipalz.com/${customLink?.customLink}/posPayment?orderId=${qrBill.requestBillId}`,
            },
          },
          200,
        );
      }

      const createQrBill = await QrBill.create({
        businessId: table?.businessId,
        captainId: captainId,
        date: Date.now(),
        requestBillId: billRequestId,
        serviceCharge: userSession?.serviceCharge,
        tableName: table?.name,
        tax: userSession?.finalTax,
        total: userSession?.finalTotal,
        expireIn: 300000,
        subTotal: userSession?.initialTotal,
      });

      return c.json(
        {
          message: "Table settled successfully",
          err: false,
          data: {
            qrBillId: createQrBill.requestBillId,
            expireIn: createQrBill.expireIn,
            path: `https://hipal-test.hipalz.com/${customLink?.customLink}/posPayment?orderId=${createQrBill.requestBillId}`,
          },
        },
        200,
      );
    },
  )
  .get(
    "/qr_webhook/:billRequestId",
    zValidator(
      "param",
      z.object({
        billRequestId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { billRequestId } = c.req.param();
      const paymentStatus = await QrBill.findOne({
        requestBillId: billRequestId,
      });

      return c.json(
        {
          message: "listing qr bill",
          err: false,
          data: {
            status: paymentStatus?.status,
          },
        },
        200,
      );
    },
  )
  .post(
    "/e_bill",
    zValidator(
      "json",
      z.object({
        phoneNumbers: z.array(z.string().min(1).max(500)).optional(),
        businessId: z.string().min(1).max(500),
        tableId: z.string().min(1).max(500),
        userIds: z.array(z.string().min(1).max(500)).optional(),
      }),
    ),
    async (c) => {
      const {
        phoneNumbers = [],
        businessId,

        tableId,
      } = await c.req.json();
      const business = await Business.findById(businessId);

      const longUrl = `https://hipal-test.hipalz.com/${business?.customLink}/ebill?tableId=${tableId}`;

      const uniqueOrderId = nanoid(5);
      let findLongUrl = await BillUrlModel.findOne({ longUrl });

      if (!findLongUrl) {
        const createShortUrl = await BillUrlModel.create({
          longUrl: longUrl,
          shortUrl: `https://api.test.hipalz.com/surl/c/b?urlCode=${uniqueOrderId}`,
          urlCode: uniqueOrderId,
          createdAt: Date.now(),
        });

        findLongUrl = createShortUrl;
      }

      for (let i = 0; i < phoneNumbers?.length; i++) {
        const options = {
          method: "POST",
          url: "https://control.msg91.com/api/v5/flow/",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            authkey: "387796AmyGlDBq63b2d75aP1",
          },
          data: {
            template_id: "6787e7e6d6fc0533d778a013",
            sender: "HiPalc",
            short_url: "0",
            mobiles: `91${phoneNumbers[i]}`,
            businessname: business?.name,
            bill: findLongUrl.shortUrl,
          },
        };
        const res = await axios(options);
      }

      return c.json(
        {
          message: "Ebill sent successfully",
          err: false,
        },
        200,
      );
    },
  )

  .get(
    "/table_offline_alert/:billRequestId",
    zValidator(
      "param",
      z.object({
        billRequestId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { billRequestId } = c.req.param();
      const findOfflineAlert = await PaymentAlert.findOne({
        alertType: "OFFLINE",
        posBillRequestId: billRequestId,
        isAccepted: false,
        isRejected: false,
      }).populate("userId order_id");
      return c.json(
        {
          message: "Offline alert fetched successfully",
          err: false,
          data: findOfflineAlert || {},
        },
        200,
      );
    },
  )
  .post(
    "/kot_users",
    zValidator(
      "json",
      z.object({
        userIds: z.array(z.string().min(1).max(500)),
      }),
    ),
    async (c) => {
      const { userIds = [] } = await c.req.json();
      const users = await User.find({
        _id: { $in: userIds },
      }).select("name phone");
      return c.json(
        {
          message: "Users fetched successfully",
          err: false,
          data: users,
        },
        200,
      );
    },
  )

  .post("/transfer_table", zValidator("json", switchTableschema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const {
        businessId,
        transferBy,
        transferType,
        fromTableId,
        toTableId,
        kotIds,
        itemIds = [],
      } = (await c.req.json()) as SwitchTableType;
      const fromTable = await Table.findById(fromTableId);
      const toTable = await Table.findById(toTableId);

      if (!fromTable || !toTable) {
        return c.json(
          {
            message: "Table not found",
            err: true,
            data: {},
          },
          400,
        );
      }
      const fetchHiCode = await UserSession.findOne({
        tableName: fromTable.name,
        businessId: businessId,
      });

      // check if bill already generated for a table
      if (fetchHiCode?.billRequestId) {
        return c.json(
          {
            message: `Bill already generated for table ${fetchHiCode.tableName} by ${fetchHiCode?.billGeneratedBy} you can't transfer the table`,
            err: true,
            data: {
              success: false,
            },
          },
          400,
        );
      }
      if (fromTable.status === "EMPTY" || fromTable.totalItemCount === 0) {
        return c.json(
          {
            message: "transfer not possible from empty table",
            err: true,
            data: {},
          },
          400,
        );
      }

      if (transferType === "TABLE") {
        if (toTable.status === "ACTIVE") {
          return c.json(
            {
              message: "Table already active",
              err: true,
              data: {},
            },
            400,
          );
        }

        await KotOrder.updateMany(
          {
            tableName: fromTable.name,
            settled: false,
            accepted: true,
            businessId,
          },
          {
            $set: {
              tableName: toTable.name,
              tableId: toTable._id,
              transferd: true,
              transferedBy: transferBy,
              fromTable: fromTable.name,
              toTable: toTable.name,
            },
          },
          { session },
        );

        await UserSession.findOneAndUpdate(
          {
            tableName: fromTable.name,
            businessId,
          },
          {
            $set: {
              tableName: toTable.name,
              transferTableFrom: fromTable._id,
              transferTableTo: toTable._id,
              isTransfer: true,
              transferBy,
              transferType: "TABLE",
            },
          },
          { session },
        );

        await Table.findByIdAndUpdate(
          fromTableId,
          {
            status: "EMPTY",
            capacity: 0,
            hiCode: "",
            currentTableAmount: 0,
            totalItemCount: 0,
            userIds: [],
            isTransfer: false,
          },
          { session },
        );
        await Table.findByIdAndUpdate(
          toTableId,
          {
            status: fromTable.status,
            capacity: fromTable?.capacity,
            hiCode: fromTable?.hiCode,
            currentTableAmount: fromTable?.currentTableAmount,
            totalItemCount: fromTable?.totalItemCount,
            userIds: fromTable?.userIds,
            isTransfer: true,
          },
          { session },
        );

        return c.json(
          {
            message: "Table transfer successfully",
            err: false,
            data: {},
          },
          200,
        );
      }

      if (transferType === "ITEM") {
        const kotOrders = await KotOrder.find({
          cart: { $elemMatch: { _id: { $in: itemIds } } },
          settled: false,
          accepted: true,
          tableName: fromTable.name,
          transferd: false,
        });

        if (kotOrders.length === 0) {
          return c.json(
            {
              message: "No items found in the KotOrder",
              err: true,
              data: {},
            },
            400,
          );
        }

        for (const kotOrder of kotOrders) {
          const removedItems = [];
          for (const item of kotOrder.cart) {
            if (itemIds.includes(item._id.toString())) {
              // Assuming `transferBy` contains the user ID
              removedItems.push(item);
            }
          }

          // Filter out items to be removed from the cart
          kotOrder.cart = kotOrder.cart.filter(
            (item) => !itemIds.includes(item._id.toString()),
          );

          if (kotOrder.cart.length === 0) {
            // Delete the KotOrder if the cart is empty
            await KotOrder.deleteOne({ _id: kotOrder._id }, { session });
          } else {
            // Save the updated `kotOrder` with modified cart
            await kotOrder.save({ session });
          }

          // Prepare the new `KotOrder` without `_id` to avoid duplicate key errors
          const { _id, ...newKotOrderData } = kotOrder.toObject();

          const totalBill = calculateCartBill(removedItems);

          // Create a new `KotOrder` with the removed items
          await KotOrder.create(
            [
              {
                ...newKotOrderData,
                cart: removedItems,
                tableName: toTable.name,
                tableId: toTable._id,
                transferd: true,
                transferedBy: transferBy,
                businessId,
                date: Date.now(),
                fromTable: fromTable.name,
                toTable: toTable.name,
              },
            ],
            { session },
          );

          const old = await UserSession.findOne({
            tableName: fromTable.name,
            businessId,
          });

          const fromTempTable = await UserSession.findOne({
            tableName: toTable.name,
            businessId,
          });
          let hiCode = "";
          if (!fromTempTable) {
            hiCode = Math.floor(1000 + Math.random() * 9000).toString();

            const pos = await BusinessPosConfig.findOne({
              businessId,
            }).populate("posId");
            const tenDigitCode = generateTenDigitCode();
            const registerUser = await axios.post(
              "http://api.petpooja.com/V1/captainorders/save_menu_qr_customer_information",
              {
                app_key: pos?.posId.accessKey,
                app_secret: pos?.posId.secretKey,
                access_token: pos?.posId.authToken,
                restID: pos?.posId.restId,
                phone: tenDigitCode,
                name: old.customerName || "Guest",
              },
            );

            if (registerUser.data.success === "0") {
              throw new Error("Failed to register user");
            }
            await UserSession.create(
              [
                {
                  businessId,
                  tableName: toTable.name,
                  transferTableFrom: fromTable._id,
                  transferTableTo: toTable._id,
                  isTransfer: true,
                  customerName: old.customerName || "Guest",
                  transferBy,
                  transferType: "ITEM",
                  hiCode: hiCode,
                  pin: tenDigitCode,
                  date: Date.now(),
                },
              ],
              { session },
            );
          }

          await Table.findByIdAndUpdate(
            fromTableId,
            {
              $inc: {
                currentTableAmount: -totalBill,
                totalItemCount: -removedItems.length,
              },
              isTransfer: true,
            },
            { session },
          );

          await Table.findByIdAndUpdate(
            toTableId,
            {
              $inc: {
                currentTableAmount: totalBill,
                totalItemCount: removedItems.length,
              },
              hiCode: fromTempTable?.hiCode || hiCode,
              status: "ACTIVE",
              isTransfer: true,
              transferType: "ITEM",
            },
            { session },
          );
        }

        return c.json(
          {
            message: "items transfer successfully",
            err: false,
            data: {},
          },
          200,
        );
      }
    });
  })

  .get(
    "/get_table_session/:tableName/:businessId",
    zValidator(
      "param",
      z.object({
        tableName: z.string().min(1).max(500),
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { tableName, businessId } = c.req.param();

      const tableData = await Table.findOne({
        businessId,
        name: tableName,
      });

      let tableSession = await UserSession.findOne({
        businessId,
        tableName,
      }).select(
        "transferTableFrom transferTableTo isTransfer transferBy transferType",
      );

      if (!tableSession || tableSession.transferTableFrom === "") {
        tableSession = await UserSession.findOne({
          transferTableFrom: tableData?._id.toString(),
          businessId,
        }).select(
          "transferTableFrom transferTableTo isTransfer transferBy transferType",
        );

        if (!tableSession) {
          tableSession = await UserSession.findOne({
            transferTableTo: tableData?._id.toString(),
            businessId,
          }).select(
            "transferTableFrom transferTableTo isTransfer transferBy transferType",
          );
        }
      }

      return c.json(
        {
          message: "Table session fetched successfully",
          err: false,
          data: tableSession || {
            isTransfer: false,
          },
        },
        200,
      );
    },
  )

  .post(
    "/free_table",
    ubacMiddleware("free_table"),
    zValidator(
      "json",
      z.object({
        tableId: z.string().min(1).max(500),
        performedBy: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { tableId, performedBy } = await c.req.json();

        const table = await Table.findById(tableId);
        if (table?.status === "ACTIVE") {
          const kots = await KotOrder.find({
            tableName: table?.name,
            settled: false,
            businessId: table?.businessId,
            accepted: true,
          }).select("_id");
          const kotIds = kots.map((kot) => kot._id.toString());

          const createUnsettleTable = new UnsettleTable(
            {
              businessId: table?.businessId,
              capacity: table?.capacity,
              tableId: table?._id,
              kotIds,
              status: "ACTIVE",
              totalItemCount: table?.totalItemCount,
              userIds: table?.userIds,
              currentTableAmount: table?.currentTableAmount,
              date: Date.now(),
              performedBy: performedBy,
            },
            {
              session,
            },
          );

          await createUnsettleTable.save();
          await KotOrder.updateMany(
            {
              tableName: table?.name,
              settled: false,
              businessId: table?.businessId,
              accepted: true,
            },
            { $set: { rejected: true, accepted: false } },
            { session },
          );

          await UserSession.deleteOne(
            {
              tableName: table?.name,
              businessId: table?.businessId,
            },
            { session },
          );

          await Table.findByIdAndUpdate(
            tableId,
            {
              hiCode: "",
              userIds: [],
              currentTableAmount: 0,
              totalItemCount: 0,
              status: "EMPTY",
              totalUserIds: [],
              isTransfer: false,
              edited: false,
              editedBy: null,
            },
            { session },
          );
        }
        //for empty table
        await KotOrder.updateMany(
          {
            tableName: table?.name,
            settled: false,
            businessId: table?.businessId,
            accepted: false,
            rejected: false,
          },
          { $set: { settled: true } },
          { session },
        );

        await UserSession.deleteOne(
          {
            tableName: table?.name,
            businessId: table?.businessId,
          },
          { session },
        );

        await Table.findByIdAndUpdate(
          tableId,
          {
            hiCode: "",
            userIds: [],
            currentTableAmount: 0,
            totalItemCount: 0,
            status: "EMPTY",
            totalUserIds: [],
            isTransfer: false,
            edited: false,
            editedBy: null,
          },
          { session },
        );

        return c.json(
          {
            message: "User kicked successfully",
            err: false,
            data: {},
          },
          200,
        );
      });
    },
  )

  .get(
    "/unsettle_table/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId } = c.req.param();

        const unSettledTables = await UnsettleTable.find({
          businessId,
          isDeleted: false,
        })
          .populate({
            path: "tableId",
            select: "name",
          })
          .populate({
            path: "userIds",
            select: "name phone",
          })
          .populate({
            path: "performedBy",
            select: "name",
          });

        return c.json(
          {
            message: "Unsettled tables fetched successfully",
            err: false,
            data: unSettledTables,
          },
          200,
        );
      });
    },
  )

  .post(
    "/resolve_table",
    ubacMiddleware("resolve_table"),
    zValidator("json", resolveTableSchema),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const {
          businessId,
          unSettleTableId,
          captainId,
          reasonForSettle,
          settleAmount,
          orderId,
          settleModes = [],
          split,

          duesUserId,
          npcUserId,
        } = await c.req.json();

        const paymentMode = await UpiMode.findById(settleModes[0]?._id);
        const captain = await User.findById(captainId);
        const npcUser = await NpcUser.findById(npcUserId);

        const unSettleTable = await UnsettleTable.findOne({
          _id: unSettleTableId,
          businessId,
          isDeleted: false,
        }).populate("tableId");
        if (!unSettleTable) {
          return c.json(
            {
              message: "Unsettled table not found",
              err: true,
              data: {},
            },
            400,
          );
        }

        const uniqueOrderId = nanoid(15);

        let modifyTotal = 0;
        if (
          paymentMode?.name === "npc" ||
          paymentMode?.name === "dues" ||
          paymentMode?.name === "complementary"
        ) {
          modifyTotal = 0;
        } else {
          modifyTotal = settleAmount;

          if (settleModes.length > 1) {
            for (const settle of settleModes) {
              if (settle.name === "complementary") {
                modifyTotal -= settle.amount ?? 0;
              }
            }
          }
        }

        const saveOrder = await Order.create(
          [
            {
              total:
                paymentMode?.name === "npc" ||
                paymentMode?.name === "complementary"
                  ? 0
                  : settleAmount,
              currency: "INR",
              receipt: uniqueOrderId,
              userId: paymentMode?.name === "npc" ? npcUser?.userId : captainId,
              claimedCoins: 0,
              tableName: unSettleTable.tableId.name,
              tips: 0,
              billValue: settleAmount,
              businessId: businessId,
              order_id: uniqueOrderId,

              date: Date.now(),
            },
          ],
          { session },
        );

        const createPayment = await Payment.create(
          [
            {
              businessId: businessId,
              order_id: saveOrder[0]._id,
              total: saveOrder[0].total,
              mode: settleModes.length > 1 ? "split" : paymentMode?.name,
              status: "SUCCESS",
              paymentMode: settleModes.length > 1 ? "split" : paymentMode?.name,
              userId: paymentMode?.name === "npc" ? npcUser?.userId : captainId,
              claimedCoins: 0,
              billValue: saveOrder[0].billValue,
              tips: 0,
              tableName: saveOrder[0].tableName,
              earnCoins: 0,
              razorpayEventId: nanoid(15),
              razorpayOrderId: nanoid(15),
              razorpayPaymentId: nanoid(15),
              settleType: "FREE_SETTLE",
              comment: reasonForSettle,
              posBillId: orderId,
              unSettleTableId: unSettleTableId,
              splitModes: settleModes,

              waiterName: captain?.name,
              date: Date.now(),
            },
          ],
          { session },
        );
        if (duesUserId && paymentMode?.name === "dues") {
          const createPaymentDues = await PendingDues.create(
            [
              {
                billId: createPayment[0]._id,
                businessId: saveOrder[0].businessId,
                date: Date.now(),
                duesUserId: duesUserId,
                isSettled: false,
              },
            ],
            {
              session,
            },
          );

          await DuesUser.findByIdAndUpdate(
            duesUserId,
            {
              $inc: {
                totalDuesAmount: saveOrder[0].total,
              },
            },
            { session },
          );
        }

        if (npcUserId && paymentMode?.name === "npc") {
          await NpcUser.findByIdAndUpdate(
            npcUserId,
            {
              $inc: {
                totalNpcAmount: saveOrder[0].total,
              },
            },
            { session },
          );
        }

        await PaymentAlert.create(
          [
            {
              businessId: saveOrder[0]?.businessId,
              alertType: "FORCE_SETTLE",
              payment_id: createPayment[0]._id,
              coinsApplied: 0,
              status: "SUCCESS",
              order_id: saveOrder[0]?._id,
              message: `Paid ${saveOrder[0]?.total}`,
              tableName: saveOrder[0]?.tableName,
              isAccepted: false,
              userId: saveOrder[0]?.userId,
              posDiscount: 0,
              date: Date.now(),
              mode: paymentMode?.name,
            },
          ],
          { session },
        );

        await UnsettleTable.findByIdAndUpdate(
          unSettleTableId,
          {
            isDeleted: true,
          },
          { session },
        );

        return c.json(
          {
            message: "Table resolved successfully",
            err: false,
            data: {},
          },
          200,
        );
      });
    },
  );

export default tableRouter;
