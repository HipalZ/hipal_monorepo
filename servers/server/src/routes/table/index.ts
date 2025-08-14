import {
  BillUrlModel,
  Business,
  BusinessPosConfig,
  DuesUser,
  KotOrder,
  LoyaltySettings,
  NpcUser,
  Order,
  Payment,
  PaymentAlert,
  PendingDues,
  QrBill,
  SplitBillTableSession,
  Table,
  UnsettleTable,
  UpiMode,
  User,
  UserSession,
} from "@hi/db-models";
import {
  type SwitchTableType,
  normalSettleSchema,
  switchTableschema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { type ClientSession } from "mongodb";
import { nanoid } from "nanoid";
import { z } from "zod";
import { ubacMiddleware } from "../../../middleware/checkPermissions";
import { checkOriginBillIsSplit } from "../../services/splitBill";
import { calculateCartBill } from "../../utils/helper";
import { posApiPaths } from "../../utils/posConfig/petPooja";
// import { queueClient } from "../../utils/queue/queueClient";
import { respond } from "../../utils/response";
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

      const businessPosConfig = await BusinessPosConfig.exists({
        businessId,
        isDeleted: false,
        active: true,
      });

      const tables = await Table.find({
        businessId,
        active: true,
        status: "ACTIVE",
        pos: !!businessPosConfig,
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
    "/fetch_all",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const businessPosConfig = await BusinessPosConfig.exists({
        businessId,
        isDeleted: false,
        active: true,
      });

      const tables = await Table.find({
        businessId,
        active: true,
        status: ["ACTIVE", "EMPTY"],
        pos: !!businessPosConfig,
      }).select("name _id status currentTableAmount");

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

      const businessPosConfig = await BusinessPosConfig.exists({
        businessId,
        isDeleted: false,
        active: true,
      });

      const tables = await Table.find({
        businessId,
        status: "EMPTY",
        active: true,
        pos: !!businessPosConfig,
        $or: [
          {
            internalZoneId: { $exists: true },
          },
          {
            zoneId: { $lte: "0" },
          },
        ],
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

  .get(
    "/unsettle_table/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const unsettleTables = await UnsettleTable.find({
        businessId: businessId,
        sync: false,
      });

      return c.json(
        {
          message: "tables fetched successfully",
          err: false,
          data: unsettleTables,
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
    "/normal_settle",
    ubacMiddleware("normal_settle"),
    zValidator("json", normalSettleSchema),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const {
          tableId,
          captainId,
          billId,
          settleModes = [],
          duesUserId,
          npcUserId,
          variantId,
        } = await c.req.json();
        const paymentMode = await UpiMode.findById(settleModes[0]?._id);

        if (!paymentMode) {
          return respond(c, "Payment mode not found", true, 404, {});
        }

        const billAlreadySettled = await Payment.findOne({
          billId: variantId ? variantId : billId,
        });

        if (billAlreadySettled) {
          return respond(c, "Bill already settled", true, 409, {});
        }

        const table = await Table.findById(tableId);
        const tableSession = await UserSession.findOne({
          businessId: table?.businessId,
          tableName: table?.name,
        });
        const captain = await User.findById(captainId);

        if (!table || !tableSession || !captain) {
          return respond(c, "Table or Captain not found", true, 404, {});
        }
        const businessLoyalty = await LoyaltySettings.findOne({
          businessId: table?.businessId,
        });
        const pos = await BusinessPosConfig.findOne({
          businessId: table?.businessId,
          isDeleted: false,
          active: true,
        });
        if (!pos) {
          return respond(c, "Pos not found", true, 400, {});
        }

        const npcUser = await NpcUser.findById(npcUserId);
        //no

        const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
        if (originBillIsSplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }

          const splitTableSessionData =
            await SplitBillTableSession.findById(variantId);
          if (!splitTableSessionData) {
            return respond(c, "Split table session not found", true, 404, {});
          }

          if (tableSession.variantsCounts > 1) {
            const uniqueOrderId = nanoid(15);
            let modifyTotal = 0;
            if (
              paymentMode?.name === "npc" ||
              paymentMode?.name === "dues" ||
              paymentMode?.name === "complementary"
            ) {
              modifyTotal = 0;
            } else {
              modifyTotal = splitTableSessionData?.total || 0;

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
                      : splitTableSessionData?.total || 0,
                  currency: "INR",
                  receipt: uniqueOrderId,
                  userId:
                    paymentMode?.name === "npc"
                      ? npcUser?.userId
                      : splitTableSessionData?.customerIds?.[0] || captainId,
                  claimedCoins: splitTableSessionData?.claimedCoins || 0,
                  tableName: table?.name,
                  tips: splitTableSessionData?.tips || 0,
                  billValue: splitTableSessionData?.subTotal || 0,
                  businessId: table?.businessId,
                  order_id: uniqueOrderId,
                  discount: splitTableSessionData?.discount || 0,
                  couponDiscount: splitTableSessionData?.couponDiscount || 0,
                  gst: splitTableSessionData?.gst || 0,

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
                  paymentMode:
                    settleModes.length > 1 ? "split" : paymentMode?.name,
                  userId: saveOrder[0].userId,
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
                  posBillId: splitTableSessionData?._id,
                  tax:
                    paymentMode?.name === "npc" ||
                    paymentMode?.name === "complementary"
                      ? 0
                      : splitTableSessionData?.gst,
                  serviceCharge:
                    paymentMode?.name === "npc" ||
                    paymentMode?.name === "complementary"
                      ? 0
                      : splitTableSessionData?.serviceCharge,

                  waiterName: captain?.name,
                  splitModes: settleModes,
                  date: Date.now(),
                  discount: splitTableSessionData?.discount,
                  couponDiscount: tableSession?.couponDiscount,
                  billId: splitTableSessionData?._id.toString(),
                  billItems: splitTableSessionData?.items || [],
                  isSplitBillVariant: true,
                },
              ],
              { session },
            );

            if (duesUserId && paymentMode?.name === "dues") {
              await PendingDues.create(
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

            await PaymentAlert.updateOne(
              {
                tableName: table?.name,
                isAccepted: false,
                alertType: "OFFLINE",
                businessId: table?.businessId,
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
                    splitTableSessionData?.claimedCoins &&
                    splitTableSessionData?.claimedCoins > 0
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

            await SplitBillTableSession.updateOne(
              { _id: variantId },
              { $set: { isPaid: true } },
              { session },
            );
            await UserSession.findOneAndUpdate(
              {
                businessId: table?.businessId,
                tableName: table?.name,
              },
              {
                $inc: {
                  variantsCounts: -1,
                },
              },
              { session },
            );
          }

          if (tableSession?.variantsCounts === 1) {
            //only cariant

            const splitTableSessionData =
              await SplitBillTableSession.findById(variantId);
            if (!splitTableSessionData) {
              return respond(c, "Split table session not found", true, 404, {});
            }
            const npcUser = await NpcUser.findById(npcUserId);

            const uniqueOrderId = nanoid(15);
            let modifyTotal = 0;
            if (
              paymentMode?.name === "npc" ||
              paymentMode?.name === "dues" ||
              paymentMode?.name === "complementary"
            ) {
              modifyTotal = 0;
            } else {
              modifyTotal = splitTableSessionData?.total || 0;

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
                      : splitTableSessionData?.total || 0,
                  currency: "INR",
                  receipt: uniqueOrderId,
                  userId:
                    paymentMode?.name === "npc"
                      ? npcUser?.userId
                      : splitTableSessionData?.customerIds?.[0] || captainId,
                  claimedCoins: splitTableSessionData?.claimedCoins || 0,
                  tableName: table?.name,
                  tips: splitTableSessionData?.tips || 0,
                  billValue: splitTableSessionData?.subTotal || 0,
                  businessId: table?.businessId,
                  order_id: uniqueOrderId,
                  discount: splitTableSessionData?.discount || 0,
                  couponDiscount: splitTableSessionData?.couponDiscount || 0,
                  gst: splitTableSessionData?.gst || 0,

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
                  paymentMode:
                    settleModes.length > 1 ? "split" : paymentMode?.name,
                  userId: saveOrder[0].userId,
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
                  posBillId: splitTableSessionData?._id,
                  tax:
                    paymentMode?.name === "npc" ||
                    paymentMode?.name === "complementary"
                      ? 0
                      : splitTableSessionData?.gst,
                  serviceCharge:
                    paymentMode?.name === "npc" ||
                    paymentMode?.name === "complementary"
                      ? 0
                      : splitTableSessionData?.serviceCharge,

                  waiterName: captain?.name,
                  splitModes: settleModes,
                  date: Date.now(),
                  discount: splitTableSessionData?.discount,
                  couponDiscount: splitTableSessionData?.couponDiscount,
                  billId: splitTableSessionData?._id.toString(),
                  billItems: splitTableSessionData?.items || [],
                  isSplitBillVariant: true,
                },
              ],
              { session },
            );

            if (duesUserId && paymentMode?.name === "dues") {
              await PendingDues.create(
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

            await PaymentAlert.updateOne(
              {
                tableName: table?.name,
                isAccepted: false,
                alertType: "OFFLINE",
                businessId: table?.businessId,
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
                    splitTableSessionData?.claimedCoins &&
                    splitTableSessionData?.claimedCoins > 0
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

            await SplitBillTableSession.updateOne(
              { _id: variantId },
              { $set: { isPaid: true } },
              { session },
            );

            await UserSession.findOneAndUpdate(
              {
                businessId: table?.businessId,
                tableName: table?.name,
              },
              {
                $inc: {
                  variantsCounts: -1,
                },
              },
              { session },
            );
          }
          if (tableSession?.variantsCounts === 1) {
            await KotOrder.updateMany(
              {
                tableName: table?.name,
                settled: false,
                businessId: table?.businessId,
              },
              { $set: { settled: true } },
              { session },
            );

            let modifyTotal = 0;
            if (
              paymentMode?.name === "npc" ||
              paymentMode?.name === "dues" ||
              paymentMode?.name === "complementary"
            ) {
              modifyTotal = 0;
            } else {
              modifyTotal = tableSession?.total || 0;

              if (settleModes.length > 1) {
                for (const settle of settleModes) {
                  if (settle.name === "complementary") {
                    modifyTotal -= settle.amount ?? 0;
                  }
                }
              }
            }

            const payload = {
              app_key: pos.accessKey,
              app_secret: pos.secretKey,
              access_token: pos.authToken,
              restID: pos.restId,
              pin: tableSession?.pin,
              tableNo: table?.name,
            };

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

            setTimeout(() => {
              (async () => {
                try {
                  // 1. Request the bill
                  const {
                    data: { bill_request_id },
                  } = await axios.post(posApiPaths.requestBill, payload, {
                    headers: { "Content-Type": "application/json" },
                  });
                } catch (err) {
                  console.error("Failed to request/settle bill:", err);
                }
              })();
            }, 10000);

            setTimeout(() => {
              (async () => {
                try {
                  // 1. Request the bill
                  const {
                    data: { bill_request_id },
                  } = await axios.post(posApiPaths.requestBill, payload, {
                    headers: { "Content-Type": "application/json" },
                  });

                  // 2. Settle the table
                  const { data: settleData } = await axios.post(
                    posApiPaths.settleTable,
                    {
                      app_key: pos.accessKey,
                      app_secret: pos.secretKey,
                      access_token: pos.authToken,
                      restID: pos.restId,
                      bill_request_id,
                      amount_paid: tableSession?.total || 0,
                      pin: tableSession?.pin,
                    },
                  );

                  // 3. If settlement failed (success === "0"), upsert into UnsettleTable
                  if (settleData.success === "0") {
                    await UnsettleTable.findOneAndUpdate(
                      {
                        businessId: tableSession?.businessId,
                        tableName: tableSession?.tableName,
                        pin: tableSession?.pin,
                      },
                      {
                        sync: false,
                        // <-- use settleData.request_id, not response.data.request_id
                        requestId: settleData.request_id,
                        pin: tableSession?.pin,
                        restId: pos.restId,
                        date: Date.now(),
                        total: tableSession?.total || 0,
                      },
                      { new: true, upsert: true },
                    );
                  }

                  const unsettleTable = await UnsettleTable.find({
                    businessId: tableSession?.businessId,
                    restId: pos.restId,
                    sync: false,
                  });

                  for (const table of unsettleTable) {
                    const payload = {
                      app_key: pos.accessKey,
                      app_secret: pos.secretKey,
                      access_token: pos.authToken,
                      restID: pos.restId,
                      pin: table?.pin,
                      tableNo: table?.tableName,
                    };

                    await axios.post(posApiPaths.requestBill, payload, {
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                  }
                } catch (err) {
                  console.error("Failed to request/settle bill:", err);
                }
              })();
            }, 35000);

            await UserSession.deleteOne(
              {
                businessId: table?.businessId,
                tableName: table?.name,
              },
              { session },
            );
          }

          return respond(c, "Table settled successfully", false, 200, {});
        }

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
          modifyTotal = tableSession?.total || 0;

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
                  : tableSession?.total || 0,
              currency: "INR",
              receipt: uniqueOrderId,
              userId:
                paymentMode?.name === "npc"
                  ? npcUser?.userId
                  : tableSession?.customerIds?.[0] || captainId,
              claimedCoins: tableSession?.claimedCoins || 0,
              tableName: table?.name,
              tips: tableSession?.tips || 0,
              billValue: tableSession?.subTotal || 0,
              businessId: table?.businessId,
              order_id: uniqueOrderId,
              discount: tableSession?.discount || 0,
              couponDiscount: tableSession?.couponDiscount || 0,
              gst: tableSession?.gst || 0,

              date: Date.now(),
            },
          ],
          { session },
        );

        const payload = {
          app_key: pos.accessKey,
          app_secret: pos.secretKey,
          access_token: pos.authToken,
          restID: pos.restId,
          pin: tableSession?.pin,
          tableNo: table?.name,
        };

        const createPayment = await Payment.create(
          [
            {
              businessId: table?.businessId,
              order_id: saveOrder[0]._id,
              total: saveOrder[0].total,
              mode: settleModes.length > 1 ? "split" : paymentMode?.name,
              status: "SUCCESS",
              paymentMode: settleModes.length > 1 ? "split" : paymentMode?.name,
              userId: saveOrder[0].userId,
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
              posBillId: tableSession?._id,
              tax:
                paymentMode?.name === "npc" ||
                paymentMode?.name === "complementary"
                  ? 0
                  : tableSession?.gst,
              serviceCharge:
                paymentMode?.name === "npc" ||
                paymentMode?.name === "complementary"
                  ? 0
                  : tableSession?.serviceCharge,

              waiterName: captain?.name,
              splitModes: settleModes,
              date: Date.now(),
              discount: tableSession?.discount,
              couponDiscount: tableSession?.couponDiscount,
              billId: tableSession?._id.toString(),
              billItems: tableSession?.items || [],
              pin: tableSession?.pin,
            },
          ],
          { session },
        );

        if (duesUserId && paymentMode?.name === "dues") {
          await PendingDues.create(
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

        setTimeout(() => {
          (async () => {
            try {
              // 1. Request the bill
              const {
                data: { bill_request_id },
              } = await axios.post(posApiPaths.requestBill, payload, {
                headers: { "Content-Type": "application/json" },
              });
            } catch (err) {
              console.error("Failed to request/settle bill:", err);
            }
          })();
        }, 10000);

        setTimeout(() => {
          (async () => {
            try {
              // 1. Request the bill
              const {
                data: { bill_request_id },
              } = await axios.post(posApiPaths.requestBill, payload, {
                headers: { "Content-Type": "application/json" },
              });

              // 2. Settle the table
              const { data: settleData } = await axios.post(
                posApiPaths.settleTable,
                {
                  app_key: pos.accessKey,
                  app_secret: pos.secretKey,
                  access_token: pos.authToken,
                  restID: pos.restId,
                  bill_request_id,
                  amount_paid: saveOrder[0].total,
                  pin: tableSession?.pin,
                },
              );

              // 3. If settlement failed (success === "0"), upsert into UnsettleTable
              if (settleData.success === "0") {
                await UnsettleTable.findOneAndUpdate(
                  {
                    businessId: saveOrder[0].businessId,
                    tableName: saveOrder[0].tableName,
                    pin: tableSession?.pin,
                  },
                  {
                    sync: false,
                    // <-- use settleData.request_id, not response.data.request_id
                    requestId: settleData.request_id,
                    pin: tableSession?.pin,
                    restId: pos.restId,
                    date: Date.now(),
                    total: saveOrder[0].total,
                  },
                  { new: true, upsert: true },
                );
              }

              const unsettleTable = await UnsettleTable.find({
                businessId: saveOrder[0]?.businessId,
                restId: pos.restId,
                sync: false,
              });

              for (const table of unsettleTable) {
                const payload = {
                  app_key: pos.accessKey,
                  app_secret: pos.secretKey,
                  access_token: pos.authToken,
                  restID: pos.restId,
                  pin: table?.pin,
                  tableNo: table?.tableName,
                };

                await axios.post(posApiPaths.requestBill, payload, {
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
              }
            } catch (err) {
              console.error("Failed to request/settle bill:", err);
            }
          })();
        }, 35000);

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
            businessId: table?.businessId,
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
                tableSession?.claimedCoins && tableSession?.claimedCoins > 0
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
        billId: z.string().min(24).max(24),
        variantId: z.string().min(24).max(24).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { tableId, captainId, billId, variantId } = await c.req.json();

        const table = await Table.findById(tableId);

        const tableSession = await UserSession.findOne({
          businessId: table?.businessId,
          tableName: table?.name,
        });

        if (!tableSession || !table) {
          return respond(
            c,
            `No active session found for table ${table?.name}`,
            true,
            400,
            {},
          );
        }
        const pos = await BusinessPosConfig.findOne({
          businessId: table?.businessId,
          isDeleted: false,
          active: true,
        });
        if (!pos) {
          return respond(c, "Pos not found", true, 400, {});
        }

        const alreadySetlle = await Payment.findOne({
          billId: variantId ? variantId : billId,
        });

        if (alreadySetlle) {
          return respond(c, "Bill already settled", true, 409, {});
        }

        const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
        if (originBillIsSplit) {
          if (!variantId) {
            return respond(
              c,
              "variantId is required for split bill",
              true,
              400,
              {},
            );
          }

          await SplitBillTableSession.findOneAndUpdate(
            {
              _id: variantId,
            },
            {
              $set: {
                settleType: "HI_SETTLE",
              },
            },
            { session },
          );
        }

        await UserSession.findOneAndUpdate(
          {
            businessId: table?.businessId,
            tableName: table?.name,
          },
          {
            $set: {
              settleType: "HI_SETTLE",
            },
          },
          { session },
        );

        const customLink = await Business.findById(table?.businessId);

        const updateQrBill = await QrBill.findOneAndUpdate(
          {
            billId: variantId ? variantId : billId,
          },
          {
            $set: {
              date: Date.now(),
            },
          },
          { new: true, session, upsert: true },
        );

        return c.json(
          {
            message: "fetched qr bill",
            err: false,
            data: {
              qrBillId: billId,
              path: `https://hipal-test.hipalz.com/${
                customLink?.customLink
              }/posPayment?orderId=${variantId ? variantId : billId}`,
            },
          },
          200,
        );
      });
    },
  )
  .get(
    "/qr_webhook/:billId/:variantId",
    zValidator(
      "param",
      z.object({
        billId: z.string().min(1).max(500),
        variantId: z.string().min(1).max(500).optional(),
      }),
    ),
    async (c) => {
      const { billId, variantId } = c.req.param();

      const paymentStatus = await QrBill.findOne({
        $or: [{ billId: billId }, { billId: variantId }],
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
        variantId: z.string().min(1).max(500).optional(),
      }),
    ),
    async (c) => {
      const {
        phoneNumbers = [],
        businessId,
        variantId,
        tableId,
      } = await c.req.json();
      const business = await Business.findById(businessId);
      const tableData = await Table.findById(tableId);
      const tableSession = await UserSession.findOne({
        businessId: businessId,
        tableName: tableData?.name,
      });
      if (!tableSession) {
        return respond(c, "Table session not found", true, 404, {});
      }

      const billAlreadySplit = checkOriginBillIsSplit(tableSession);
      if (billAlreadySplit) {
        if (!variantId) {
          return respond(
            c,
            "variantId is required for split bill",
            true,
            400,
            {},
          );
        }
      }

      let billId: string;
      if (billAlreadySplit) {
        billId = variantId;
      } else {
        billId = tableSession?._id.toString();
      }

      const longUrl = `https://hipal-test.hipalz.com/${business?.customLink}/ebill?billId=${billId}`;

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
    "/table_offline_alert/:billId",
    zValidator(
      "param",
      z.object({
        billId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { billId } = c.req.param();
      const findOfflineAlert = await PaymentAlert.findOne({
        alertType: "OFFLINE",
        billId: billId,
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
        itemIds = [],
      } = (await c.req.json()) as SwitchTableType;

      const sourceTable = await Table.findById(fromTableId);
      const destinationTable = await Table.findById(toTableId);

      if (sourceTable === destinationTable) {
        return respond(
          c,
          "Cannot switch tables to the same table",
          true,
          400,
          {},
        );
      }

      const posConfigData = await BusinessPosConfig.findOne({
        businessId,
        isDeleted: false,
        active: true,
      });

      if (!posConfigData) {
        return respond(c, "Pos not found", true, 400, {});
      }

      if (!sourceTable || !destinationTable) {
        return respond(c, "Table not found", true, 404, {});
      }

      const tableSession = await UserSession.findOne({
        tableName: sourceTable.name,
        businessId,
      });

      if (!tableSession || sourceTable.status === "EMPTY") {
        return respond(
          c,
          `No active session found for table ${sourceTable.name}`,
          true,
          400,
          {},
        );
      }

      const billAlreadySplit = checkOriginBillIsSplit(tableSession);
      if (billAlreadySplit) {
        return respond(
          c,
          "Bill already split you cannot transfer the table and items",
          true,
          400,
          {},
        );
      }

      if (transferType === "TABLE") {
        await KotOrder.updateMany(
          {
            tableName: sourceTable.name,
            settled: false,
            accepted: true,
            businessId,
          },
          {
            $set: {
              tableName: destinationTable.name,
              tableId: destinationTable._id,
              transferd: true,
              transferedBy: transferBy,
              fromTable: sourceTable.name,
              toTable: destinationTable.name,
            },
          },
          { session },
        );

        await UserSession.findOneAndUpdate(
          {
            tableName: sourceTable.name,
            businessId,
          },
          {
            $set: {
              tableName: destinationTable.name,
              transferTableFrom: sourceTable._id,
              transferTableTo: destinationTable._id,
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
            transferTableFrom: "",
            transferTableTo: "",
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
            status: sourceTable.status,
            capacity: sourceTable?.capacity,
            hiCode: sourceTable?.hiCode,
            currentTableAmount: sourceTable?.currentTableAmount,
            totalItemCount: sourceTable?.totalItemCount,
            userIds: sourceTable?.userIds,
            isTransfer: true,
          },
          { session },
        );

        return c.json(
          { message: "Table transfer successfully", err: false, data: {} },
          200,
        );
      }

      if (transferType === "ITEM") {
        const kotOrders = await KotOrder.find({
          cart: { $elemMatch: { _id: { $in: itemIds } } },
          settled: false,
          accepted: true,
          tableName: sourceTable.name,
        });

        if (kotOrders.length === 0) {
          return respond(c, "No items found in the KotOrder", true, 400, {});
        }

        const destinationTableSession = await UserSession.findOne({
          tableName: destinationTable.name,
          businessId,
        });

        for (const kotOrder of kotOrders) {
          const removedItems = kotOrder.cart.filter((item) =>
            itemIds.includes(item._id.toString()),
          );

          kotOrder.cart = kotOrder.cart.filter(
            (item) => !itemIds.includes(item._id.toString()),
          );

          if (kotOrder.cart.length === 0) {
            await KotOrder.deleteOne({ _id: kotOrder._id }, { session });
          } else {
            await kotOrder.save({ session });
          }

          const { _id, ...newKotOrderData } = kotOrder.toObject();

          const calculateBillDishIds = removedItems.filter(
            (item) => !item.dish.isDeleted,
          );
          const totalBill = calculateCartBill(calculateBillDishIds);

          await KotOrder.create(
            [
              {
                ...newKotOrderData,
                cart: removedItems,
                tableName: destinationTable.name,
                tableId: destinationTable._id,
                transferd: true,
                transferedBy: transferBy,
                businessId,
                date: Date.now(),
                fromTable: sourceTable.name,
                toTable: destinationTable.name,
              },
            ],
            { session },
          );

          let hiCode = "";
          if (!destinationTableSession || destinationTable.status === "EMPTY") {
            hiCode = Math.floor(1000 + Math.random() * 9000).toString();
            const tenDigitCode = generateTenDigitCode();

            await UserSession.findOneAndUpdate(
              { businessId, tableName: destinationTable.name },
              {
                $setOnInsert: {
                  customerName: tableSession?.customerName || "Guest",
                  hiCode,
                  pin: tenDigitCode,
                  date: Date.now(),
                },
                $set: {
                  transferTableFrom: sourceTable._id,
                  transferTableTo: destinationTable._id,
                  isTransfer: true,
                  transferBy,
                  transferType: "ITEM",
                },
              },
              {
                upsert: true,
                session,
                new: true,
              },
            );
          }

          await Table.findByIdAndUpdate(
            fromTableId,
            {
              $inc: {
                currentTableAmount: -totalBill,
                totalItemCount: -removedItems.length,
              },
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
              hiCode: destinationTableSession?.hiCode || hiCode,
              status: "ACTIVE",
              isTransfer: true,
              transferType: "ITEM",
            },
            { session },
          );
        }

        return c.json(
          {
            message: "Items transferred successfully",
            err: false,
            data: {},
          },
          200,
        );
      }
    });
  })

  .post(
    "/save_unsettle_table",

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, restId, pin, tableName, requestId, total } =
          await c.req.json();

        const data = await UnsettleTable.findOneAndUpdate(
          {
            businessId: businessId,
            tableName: tableName,
            pin: pin,
          },
          {
            sync: false,
            requestId: requestId,
            pin: pin,
            restId: restId,
            date: Date.now(),
            total: total,
          },
          { new: true, upsert: true, session },
        );

        return respond(c, "updated successfully", false, 200, {});
      });
    },
  )

  .post(
    "/settle_unsettle_table",

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, pos } = await c.req.json();
        const unsettleTable = await UnsettleTable.find({
          businessId: businessId,
          restId: pos.restId,
          sync: false,
        });

        for (const table of unsettleTable) {
          const payload = {
            app_key: pos.accessKey,
            app_secret: pos.secretKey,
            access_token: pos.authToken,
            restID: pos.restId,
            pin: table?.pin,
            tableNo: table?.tableName,
          };

          const s = await axios.post(posApiPaths.requestBill, payload, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log("s", s.data);
        }

        return respond(c, "updated successfully", false, 200, {});
      });
    },
  )

  .post(
    "/sync_unsettle_table",

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, pos, tableName } = await c.req.json();
        await UnsettleTable.updateMany(
          {
            businessId: businessId,
            restId: pos.restId,
            sync: false,
            tableName: tableName,
          },
          {
            $set: {
              sync: true,
            },
          },
        );

        return respond(c, "updated successfully", false, 200, {});
      });
    },
  );

export default tableRouter;
