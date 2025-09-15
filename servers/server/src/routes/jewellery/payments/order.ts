import { JewelleryOrder, JewelleryPaymentAlert } from "@hi/db-models";
import {
  jewelleryRazorpayOrderSchema,
  //   RazorpayWebhookBodySchema,
  //   RazorpayWebhookHeadersSchema,
  razorpayOrderSchema,
} from "@hi/db-models/src/validators";

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
    "/:merchantId/online",

    zValidator("json", jewelleryRazorpayOrderSchema),
    zValidator("param", z.object({ merchantId: z.string() })),

    async (c) => {
      const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
      const {
        total,
        billValue,
        tips,
        currency,
        userId,
        claimedCoins,
        businessId,
        couponId,
        cashbackAvailable,
      } = requestData;

      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { merchantId } = c.req.param();
        const uniqueOrderId = nanoid(15);

        const client = await razorpayWrapper.getClient(merchantId);
        const response = await client.orders.create({
          amount: total * 100, // Fixed multiplication logic
          currency: currency,
          receipt: uniqueOrderId,
        });

        const saveOrder = await JewelleryOrder.create(
          [
            {
              total: total,
              currency,
              billValue: billValue,
              businessId,
              receipt: uniqueOrderId,
              userId,
              claimedCoins: claimedCoins,
              order_id: response.id,
              tips: tips,
              couponId,
              cashbackAvailable,
              date: Date.now(),
            },
          ],
          { session },
        );
        if (!saveOrder || !response)
          return respond(c, "Order not created", true, 400, {});

        return respond(c, "Order created successfully", false, 200, {
          orderId: response.id,
        });
      });
    },
  )

  .post(
    "/offline",

    zValidator("json", razorpayOrderSchema),

    async (c) => {
      const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
      const {
        total,
        billValue,
        tips,
        currency,
        userId,
        claimedCoins,
        businessId,
        couponId,
        cashbackAvailable,
      } = requestData;

      //   const orderAlreadyExist = await PaymentAlert.findOne({
      //     businessId,
      //     tableName,
      //     alertType: "OFFLINE",
      //     isAccepted: false,
      //   });

      //   if (orderAlreadyExist)
      //     return respond(
      //       c,
      //       "A request for this service is already in progress. Please wait for the staff to take action",
      //       true,
      //       400,
      //       {},
      //     );

      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const uniqueOrderId = nanoid(15);

        const saveOrder = await JewelleryOrder.create(
          [
            {
              total: total,
              currency,
              receipt: uniqueOrderId,
              userId,
              claimedCoins: claimedCoins,
              tips: tips,
              billValue: billValue,
              businessId,
              order_id: uniqueOrderId,
              couponId,
              cashbackAvailable,
              date: Date.now(),
            },
          ],
          { session },
        );
        if (!saveOrder) return respond(c, "Order not created", true, 400, {});

        await JewelleryPaymentAlert.create(
          [
            {
              businessId: businessId,
              userId: userId,
              alertType: "OFFLINE",
              orderId: saveOrder?.[0]._id,
              status: "SUCCESS",
              coinsApplied: !!(claimedCoins > 0),
              message: `Paid ${total}`,
              date: Date.now(),
              mode: "OFFLINE",
            },
          ],
          { session },
        );
        // const registrationToken = await DeviceToken.find({
        //   businessId: businessId,
        // });

        return respond(c, "Order created successfully", false, 200, {
          orderId: saveOrder?.[0]._id,
        });
      });
    },
  );

export default orderRouter;
