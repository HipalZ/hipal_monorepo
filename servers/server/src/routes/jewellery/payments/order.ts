import { JewelleryOrder, JewelleryPaymentAlert } from "@hi/db-models";
import { jewelleryPaymentOrderSchema } from "@hi/db-models/src/validators";

import { runInTransaction } from "@hi/utils";
// import type { RazorpayWebhookHeaders } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { razorpayWrapper } from "../../../utils/razorpay-wrapper";
import { respond } from "../../../utils/response";
// import {
//   addCoins,
//   calculateReward,
//   calculatedCashbackCoins,
//   removeCoins,
// } from "../../payments";
//
//dates
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);
const roles = [
  "MANAGER",
  "CO_OWNER",
  "CAPTAIN",
  "MARKETING_AGENT",
  "RESTAURANT_OWNER",
];
const orderRouter = new Hono()
  .post(
    "/:merchantId/pay_online",

    zValidator("json", jewelleryPaymentOrderSchema),
    zValidator("param", z.object({ merchantId: z.string() })),

    async (c) => {
      const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
      const { orderId } = requestData;

      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { merchantId } = c.req.param();

        const order = await JewelleryOrder.findById(orderId).session(session);

        if (!order) return respond(c, "Order not found", true, 404, {});

        const client = await razorpayWrapper.getClient(merchantId);
        const response = await client.orders.create({
          amount: order.total * 100,
          currency: order.currency,
          receipt: order.receipt,
        });

        if (!response) throw new Error("Razorpay order creation failed");

        await JewelleryOrder.updateOne(
          { _id: order._id },
          { razorpayOrderId: response.id },
          { session },
        );

        return respond(c, "Order created successfully", false, 200, {
          orderId: response.id,
        });
      });
    },
  )

  .post(
    "/",

    zValidator(
      "json",
      z.object({
        billValue: z.number().positive(),
        businessId: z.string().min(24).max(24),
        userId: z.string().min(24).max(24),
      }),
    ),

    async (c) => {
      const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
      const { billValue, userId, businessId } = requestData;

      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const uniqueOrderId = nanoid(15);

        const saveOrder = await JewelleryOrder.create(
          [
            {
              total: billValue,
              currency: "INR",
              subTotal: billValue,
              businessId,
              receipt: uniqueOrderId,
              userId,
              claimedCoins: 0,
              tips: 0,
              date: Date.now(),
              discount: 0,
              couponId: null,
              couponDiscount: 0,
              gst: 0,
            },
          ],
          { session },
        );
        if (!saveOrder) return respond(c, "Order not created", true, 400, {});

        return respond(c, "Order created successfully", false, 200, {
          orderId: saveOrder?.[0]._id,
        });
      });
    },
  )

  .get(
    "/bill/:orderId",

    zValidator(
      "param",
      z.object({
        orderId: z.string().min(24).max(24),
      }),
    ),

    async (c) => {
      const { orderId } = c.req.param();

      const orderDetails = await JewelleryOrder.findById(orderId)
        .select(
          "total userId tips claimedCoins discount couponId couponDiscount gst subTotal",
        )
        .populate({
          path: "userId",
          select: "name phone",
        });

      if (!orderDetails) return respond(c, "Order not found", true, 404, {});

      if (orderDetails.isPaid) return respond(c, "Order paid", true, 409, {});

      return respond(
        c,
        "Order details fetched successfully",
        false,
        200,
        orderDetails,
      );
    },
  )

  .post(
    "/pay_offline",

    zValidator("json", jewelleryPaymentOrderSchema),

    async (c) => {
      const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
      const { orderId } = requestData;

      const order = await JewelleryOrder.findById(orderId);
      if (!order) return respond(c, "Order not found", true, 404, {});

      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        await JewelleryPaymentAlert.create(
          [
            {
              alertType: "OFFLINE",
              orderId: order._id,
              status: "SUCCESS",
              coinsApplied: !!(order.claimedCoins > 0),
              message: `Paid ${order.total}`,
              date: Date.now(),
              mode: "OFFLINE",
              businessId: order.businessId,
            },
          ],
          { session },
        );
        // const registrationToken = await DeviceToken.find({
        //   businessId: businessId,
        // });

        return respond(c, "Order created successfully", false, 200, {
          orderId: order._id,
        });
      });
    },
  );

export default orderRouter;
