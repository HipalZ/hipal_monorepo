import {
  Business,
  BusinessPosConfig,
  KotOrder,
  Order,
  Payment,
  PetPoojaPinTemp,
  QrBill,
  Table,
  TempTableSettle,
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
      });

      console.log("tables", tables);

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
          $inc: { capacity: guestCount },
        },
        {
          new: true,
        },
      );
      console.log("table", table);

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
        billRequestId: z.string().min(1).max(500),
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
        } = await c.req.json();
        const captain = await User.findById(captainId);

        const table = await Table.findById(tableId);

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

        await Payment.create(
          [
            {
              businessId: table?.businessId,
              order_id: saveOrder[0]._id,
              total: saveOrder[0].total,
              mode: "offline",
              status: "SUCCESS",
              paymentMode: "offline",
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
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { tableId, captainId, billRequestId } = await c.req.json();

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

        console.log("getBill", getBill.data);

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
              total: getBill.data.order_data.total,
              currency: "INR",
              receipt: uniqueOrderId,
              userId: captainId,
              claimedCoins: 0,
              tableName: table?.name,
              tips: 0,
              billValue: getBill.data.order_data.core_price,
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

        await Payment.create(
          [
            {
              businessId: table?.businessId,
              order_id: saveOrder[0]._id,
              total: saveOrder[0].total,
              mode: "offline",
              status: "SUCCESS",
              paymentMode: "offline",
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

      console.log("getBill", getBill.data);

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

      if (qrBill) {
        await QrBill.findOneAndUpdate(
          {
            requestBillId: billRequestId,
          },
          {
            $set: {
              captainId: captainId,
              date: Date.now(),
              createdAt: Date.now(),
            },
          },
        );

        await qrBill.save();
        return c.json(
          {
            message: "fetched qr bill",
            err: false,
            data: {
              qrBillId: qrBill._id,
              expireIn: qrBill.expireIn,
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
        createdAt: Date.now(),
      });

      return c.json(
        {
          message: "Table settled successfully",
          err: false,
          data: {
            qrBillId: createQrBill._id,
            expireIn: createQrBill.expireIn,
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
      const isSettle = await QrBill.findOne({
        requestBillId: billRequestId,
      });

      return c.json(
        {
          message: "listing qr bill",
          err: false,
          data: {
            isSettle: isSettle?.isPaid,
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
        billRequestId: z.string().min(1).max(500),
        tableId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const {
        userIds = [],
        businessId,
        billRequestId,
        tableId,
      } = await c.req.json();
      const business = await Business.findById(businessId);
      const token =
        "EAAQk2VVQJsEBOZBP8xHCHCZAvBWeAX1APC5E08Y0PCMCTGemp6OUsJrugkr6nNNYWnnrJcTL18GHoRzRBPuW2L0CGQvkK98djZBCxaAkUxKbH148EOMtYGxvj87NTqPz9TfoyjdVWMp5sKgZBI5tIdI4yvGBtyxsRCY5y81ZBvlYdLQNCaqQQP94ZC5llBP1EtJAZDZD";
      const phoneId = "365941956611521";

      const table = await Table.findById(tableId);

      const pos = await BusinessPosConfig.findOne({
        businessId: businessId,
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

      if (!qrBill) {
        const createQrBill = await QrBill.create({
          businessId: businessId,

          date: Date.now(),
          requestBillId: billRequestId,
          serviceCharge: getBill.data.order_data.service_charge,
          tableName: table?.name,
          tax: getBill.data.order_data.tax,
          total: getBill.data.order_data.total,
          expireIn: 300000,
          createdAt: Date.now(),
        });
      }

      for (let i = 0; i < userIds.length; i++) {
        const user = await User.findById(userIds[i]);
        const res = await axios({
          method: "POST",
          url: `https://graph.facebook.com/v21.0/${phoneId}/messages?access_token=${token}`,
          data: {
            messaging_product: "whatsapp",
            to: user?.phone,
            text: {
              body: `e-bill link for http://localhost:3000/${business?.customLink}/e-bill?orderId=${billRequestId}`,
            },
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
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
  );

export default tableRouter;
