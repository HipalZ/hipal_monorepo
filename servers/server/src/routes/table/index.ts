import {
  Business,
  BusinessPosConfig,
  KotOrder,
  Order,
  Payment,
  PaymentAlert,
  PetPoojaPinTemp,
  QrBill,
  Table,
  TempTableSettle,
  UpiMode,
  User,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import type { ClientSession } from "mongodb";
import { nanoid } from "nanoid";
import { z } from "zod";
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
    zValidator(
      "json",
      z.object({
        tableId: z.string().min(1).max(500),
        captainId: z.string().min(1).max(500),
        reasonForForceSettle: z.string().min(1).max(500),
        settleAmount: z.coerce.number().optional(),
        billRequestId: z.string().min(1).max(500).optional(),
        paymentModeId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const {
          tableId,
          captainId,
          reasonForForceSettle,
          settleAmount = 0,
          billRequestId,
          paymentModeId,
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

        const paymentMode = await UpiMode.findById(paymentModeId);
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

        const table = await Table.findById(tableId);
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
        const getBillConfig = {
          app_key: pos.posId.accessKey,
          app_secret: pos.posId.secretKey,
          access_token: pos.posId.authToken,
          restID: pos.posId.restId,
          bill_request_id: billRequestId,
        };
        const getBill = await axios.post(
          "http://api.petpooja.com/V1/captainorders/get_bill/",
          getBillConfig,
        );

        if (getBill.data.success === "0") {
          return c.json(
            {
              message: getBill.data.message,
              err: true,
            },
            400,
          );
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
        const activeTable = await PetPoojaPinTemp.findOne({
          businessId: table?.businessId,
          tableName: table?.name,
        });
        const res = await axios.post(
          "http://api.petpooja.com/V1/captainorders/success_payment/",
          {
            app_key: pos?.posId.accessKey,
            app_secret: pos?.posId.secretKey,
            access_token: pos?.posId.authToken,
            restID: pos?.posId.restId,
            bill_request_id: activeTable?.billRequestId,
            amount_paid: settleAmount,
            pin: activeTable?.pin,
          },
        );

        const saveOrder = await Order.create(
          [
            {
              total: settleAmount,
              currency: "INR",
              receipt: uniqueOrderId,
              userId: captainId,
              claimedCoins: 0,
              tableName: table?.name,
              tips: 0,
              billValue: table?.currentTableAmount,
              businessId: table?.businessId,
              order_id: uniqueOrderId,

              date: Date.now(),
            },
          ],
          { session },
        );

        await Payment.create(
          [
            {
              businessId: table?.businessId,
              order_id: saveOrder[0]._id,
              total: saveOrder[0].total,
              mode: paymentMode?.name || "offline",
              status: "SUCCESS",
              paymentMode: paymentMode?.name || "offline",
              userId: saveOrder[0].userId,
              claimedCoins: 0,
              billValue: saveOrder[0].billValue,
              tips: 0,
              tableName: saveOrder[0].tableName,
              earnCoins: 0,
              razorpayEventId: nanoid(15),
              razorpayOrderId: nanoid(15),
              razorpayPaymentId: nanoid(15),
              settleType: "FORCE_SETTLE",
              comment: reasonForForceSettle,
              posBillId: getBill.data.order_data.invoice_id,
              tax: getBill.data.order_data.tax,
              serviceCharge: getBill.data.order_data.service_charge,
              posBillRequestId: billRequestId,

              waiterName: captain?.name,
              date: Date.now(),
            },
          ],
          { session },
        );
        await Table.findByIdAndUpdate(
          tableId,
          {
            status: "EMPTY",
            capacity: 0,
            hiCode: "",
            currentTableAmount: 0,
            totalItemCount: 0,
            userIds: [],
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
            },
          ],
          { session },
        );

        await PetPoojaPinTemp.deleteOne(
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
    zValidator(
      "json",
      z.object({
        tableId: z.string().min(1).max(500),
        captainId: z.string().min(1).max(500),
        billRequestId: z.string().min(1).max(500),
        paymentModeId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { tableId, captainId, billRequestId, paymentModeId } =
          await c.req.json();
        const paymentMode = await UpiMode.findById(paymentModeId);

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
        const getBillConfig = {
          app_key: pos.posId.accessKey,
          app_secret: pos.posId.secretKey,
          access_token: pos.posId.authToken,
          restID: pos.posId.restId,
          bill_request_id: billRequestId,
        };
        const getBill = await axios.post(
          "http://api.petpooja.com/V1/captainorders/get_bill/",
          getBillConfig,
        );

        if (getBill.data.success === "0") {
          return c.json(
            {
              message: getBill.data.message,
              err: true,
            },
            400,
          );
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

        const saveOrder = await Order.create(
          [
            {
              total: getBill.data.order_data.total || 0,
              currency: "INR",
              receipt: uniqueOrderId,
              userId: captainId,
              claimedCoins: 0,
              tableName: table?.name,
              tips: 0,
              billValue: getBill.data.order_data.core_price || 0,
              businessId: table?.businessId,
              order_id: uniqueOrderId,

              date: Date.now(),
            },
          ],
          { session },
        );

        const findTable = await PetPoojaPinTemp.findOne({
          businessId: table?.businessId,
          tableName: table?.name,
        });

        const createPayment = await Payment.create(
          [
            {
              businessId: table?.businessId,
              order_id: saveOrder[0]._id,
              total: saveOrder[0].total,
              mode: paymentMode?.name || "offline",
              status: "SUCCESS",
              paymentMode: paymentMode?.name || "offline",
              userId: saveOrder[0].userId,
              claimedCoins: 0,
              billValue: saveOrder[0].billValue,
              tips: 0,
              tableName: saveOrder[0].tableName,
              earnCoins: 0,
              razorpayEventId: nanoid(15),
              razorpayOrderId: nanoid(15),
              razorpayPaymentId: nanoid(15),
              settleType: "NORMAL_SETTLE",
              comment: "NORMAL SETTLE",

              posBillId: getBill.data.order_data.invoice_id,
              tax: getBill.data.order_data.tax,
              serviceCharge: getBill.data.order_data.service_charge,
              posBillRequestId: billRequestId,
              waiterName: captain?.name,
              date: Date.now(),
            },
          ],
          { session },
        );
        await Table.findByIdAndUpdate(
          tableId,
          {
            status: "EMPTY",
            capacity: 0,
            hiCode: "",
            currentTableAmount: 0,
            totalItemCount: 0,
            userIds: [],
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
            amount_paid: saveOrder[0].total,
            pin: findTable?.pin,
          },
        );
        await PetPoojaPinTemp.deleteOne(
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
              alertType: "OFFLINE",
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

      const alreadySetlle = await QrBill.findOne({
        requestBillId: billRequestId,
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
      const updateTempTableStatus = await PetPoojaPinTemp.findOneAndUpdate(
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
      const getBillConfig = {
        app_key: pos.posId.accessKey,
        app_secret: pos.posId.secretKey,
        access_token: pos.posId.authToken,
        restID: pos.posId.restId,
        bill_request_id: billRequestId,
      };
      const getBill = await axios.post(
        "http://api.petpooja.com/V1/captainorders/get_bill/",
        getBillConfig,
      );

      if (getBill.data.success === "0") {
        return c.json(
          {
            message: getBill.data.message,
            err: true,
          },
          400,
        );
      }

      const qrBill = await QrBill.findOne({
        requestBillId: billRequestId,
      });

      console.log("qrBill", qrBill);

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
        serviceCharge: getBill.data.order_data.service_charge,
        tableName: table?.name,
        tax: getBill.data.order_data.tax,
        total: getBill.data.order_data.total,
        expireIn: 300000,
        subTotal: getBill.data.order_data.core_price || 0,
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
        userIds: z.array(z.string().min(1).max(500)),
        businessId: z.string().min(1).max(500),
        tableId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const {
        userIds = [],
        businessId,

        tableId,
      } = await c.req.json();
      const business = await Business.findById(businessId);

      for (let i = 0; i < userIds?.length; i++) {
        const user = await User.findById(userIds[i]);
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
            short_url: "1",
            mobiles: user?.phone,
            businessname: business?.name,
            bill: `https://hipal-test.hipalz.com/${business?.customLink}/eBill?tableId=${tableId}`,
          },
        };
        const res = await axios(options);
        console.log("res", res.data);
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
  );

export default tableRouter;
