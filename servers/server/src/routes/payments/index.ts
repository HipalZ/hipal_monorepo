import { createHmac } from "node:crypto";
// books.ts
import {
  LoyaltyCoinsInfo,
  LoyaltySettings,
  Order,
  Payment,
  PaymentAlert,
  Reviews,
  UserReward,
  UserRewardHistory,
} from "@hi/db-models";
import type { PaymentType } from "@hi/db-models/src/validators";
import {
  PaymentAlertSchema,
  RazorpayWebhookBodySchema,
  RazorpayWebhookHeadersSchema,
  ReviewsSchema,
  acceptOrderSchema,
  orderSchema,
  paramsSchema,
  validatePaymentSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { addHours, startOfDay, subDays } from "date-fns";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { razorpayWrapper } from "../../../razorpay_wrapper";
import { respond } from "../../utils/response";
const { validateWebhookSignature } = require("../../utils/razorpay-utils");
//dates
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

//calculateDiscount
const calculateDiscount = (
  total_bill: number,
  appliedCoins: number,
  paid_Money: number,
) => {
  const valueAfterCoins = Math.abs(total_bill - appliedCoins || 0);
  const subTotal = (total_bill * 100) / 105;
  const discount = (valueAfterCoins - 1.05 * subTotal) / 1.05;
  const finalDiscount = Math.round(Math.abs(discount));

  return finalDiscount;
};

//calculate reward

const calculateReward = async (
  exist: number,
  reward: number,
  limit: number,
  session: ClientSession,
) => {
  const total = exist + reward;
  const sum = Math.min(total, limit);
  const finalReward = Math.round(Math.abs(sum - exist));
  return { finalReward, curentBalance: sum };
};

//

const addRewardHistory = async (
  status: string,
  tableName: string,
  loyaltyId: string,
  order_id: string,
  userId: string,
  addCoins: number,
  session: ClientSession,
) => {
  const data = await UserRewardHistory.create(
    [
      {
        userId: userId,
        rewards: addCoins,
        status: status,
        tableName,
        order_id,
        loyaltyId,
        date: Date.now(),
      },
    ],
    { session },
  );

  return data;
};
//
const removeRewardHistory = async (
  status: string,
  tableName: string,
  loyaltyId: string,
  order_id: string,
  userId: string,
  addCoins: number,
  session: ClientSession,
) => {
  const data = await UserRewardHistory.create(
    [
      {
        userId: userId,
        rewards: addCoins,
        status: status,
        tableName,
        order_id,
        loyaltyId,
        date: Date.now(),
      },
    ],
    { session },
  );

  return data;
};

const removeCoins = async (
  claimedCoins: number,
  tableName: string,
  loyaltyId: string,
  order_id: string,
  userId: string,
  session: ClientSession,
) => {
  const existingUser = await UserReward.findOne({ userId, loyaltyId });
  if (existingUser && existingUser.rewards >= claimedCoins) {
    const updatedReward = await UserReward.findOneAndUpdate(
      { userId, loyaltyId },
      {
        $inc: { rewards: -claimedCoins },
      },
      { new: true, session },
    );

    await removeRewardHistory(
      "MINUS",
      tableName,
      loyaltyId,

      order_id,
      userId,

      claimedCoins,

      session,
    );

    return updatedReward;
  }
  return null;
};

const addCoins = async (
  coins: number,
  userId: string,
  order_id: string,
  tableName: string,
  businessId: string,

  loyaltyId: string,

  session: ClientSession,
) => {
  const existingUser = await UserReward.findOne({ userId, loyaltyId }, null, {
    session,
  }).select("rewards");

  const existingLoyalty = await LoyaltySettings.findOne(
    { businessId: businessId },
    null,
    { session },
  ).select("rewardLimit");
  if (existingUser && existingLoyalty) {
    const coinsCalculated = await calculateReward(
      existingUser.rewards,
      coins,
      existingLoyalty?.rewardLimit as number,
      session,
    );

    await UserReward.findOneAndUpdate(
      { userId, loyaltyId },
      {
        $inc: { rewards: coinsCalculated.finalReward },
      },
      { new: true, session },
    )
      .select("rewards")
      .populate("userId", {
        phone: 1,
        name: 1,
        _id: 0,
      });
    if (coinsCalculated.finalReward > 0) {
      await addRewardHistory(
        "PLUS",
        tableName,
        loyaltyId,
        order_id,
        userId,
        coinsCalculated.finalReward,
        session,
      );
    }

    return coinsCalculated.finalReward || 0;
  }
  return 0;
};

const calculatedCashbackCoins = async (
  businessId: string,
  billValue: number,
  claimedCoins: number,
) => {
  const LoyaltySetting = await LoyaltySettings.findOne({ businessId }).select(
    "rewardLimit setCashBackPercentage",
  );
  if (
    !LoyaltySetting ||
    typeof LoyaltySetting.setCashBackPercentage !== "number"
  ) {
    console.error("LoyaltySetting not found or setReward is not a number");
    return 0; // Or handle this case as appropriate for your application
  }
  const subTotal = billValue - claimedCoins;
  const coinsToBeAdded =
    (LoyaltySetting.setCashBackPercentage / 100) * subTotal;
  if (coinsToBeAdded < 0) {
    return 0;
  }
  return Math.round(coinsToBeAdded);
};

function getBillingPeriod(billingHour: number) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const billingStartToday = addHours(todayStart, billingHour);
  const billingStartYesterday = subDays(billingStartToday, 1);
  const billingEndToday = addHours(billingStartToday, 24);

  return {
    billingStartToday: billingStartYesterday.getTime(),
    billingEndToday: billingEndToday.getTime(),
    billingStartYesterday: billingStartYesterday.getTime(),
    billingEndYesterday: billingStartToday.getTime(),
  };
}

const paymentsRouter = new Hono()
  .post(
    "/createOrder",

    zValidator("json", orderSchema),

    async (c) => {
      const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
      const {
        total,
        billValue,
        tableName,
        tips,
        currency,
        userId,
        claimedCoins,
        businessId,
      } = requestData;

      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const uniqueOrderId = nanoid(15);
        const response = await razorpayWrapper.client.orders.create({
          amount: total * 100,
          currency: "INR",
          receipt: uniqueOrderId,
        });
        const saveOrder = await Order.create(
          [
            {
              total,
              currency,
              billValue,
              businessId,
              receipt: uniqueOrderId,
              userId,
              claimedCoins: claimedCoins,
              tableName,
              order_id: response.id,
              tips: tips,
              date: Date.now(),
            },
          ],
          { session },
        );
        if (!saveOrder) return respond(c, "Order not created", true, 400, {});

        return respond(c, "Order created successfully", false, 200, {
          order_id: response.id,
        });
      });
    },
  )
  .post(
    "/reviews",

    zValidator("json", ReviewsSchema),

    async (c) => {
      const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
      const { order_id } = requestData || {};

      const review = await Reviews.findOne({ order_id: order_id });

      if (review) return respond(c, "Review already exists", true, 400, {});

      const addReview = await Reviews.create(requestData);

      if (!addReview) return respond(c, "Review not created", true, 400, {});

      return respond(c, "Review created successfully", false, 200, addReview);
    },
  )
  .post(
    "/createOfflineOrder",

    zValidator("json", orderSchema),

    async (c) => {
      const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
      const {
        total,
        billValue,
        tableName,
        tips,
        currency,
        userId,
        claimedCoins,
        businessId,
      } = requestData;
      const uniqueOrderId = nanoid(15);

      const orderAlreadyExist = await PaymentAlert.findOne({
        businessId,
        tableName,
        alertType: "OFFLINE",
        isAccepted: false,
      });

      if (orderAlreadyExist)
        return respond(
          c,
          "Order already exists for this table please wait for waiter action!",
          true,
          400,
          {},
        );

      const saveOrder = await Order.create({
        total,
        currency,
        receipt: uniqueOrderId,
        userId,
        claimedCoins: claimedCoins,
        tableName,
        tips,
        billValue,
        businessId,
        order_id: uniqueOrderId,
        date: Date.now(),
      });
      let posDiscount = 0;
      if (Number(claimedCoins) > 0) {
        posDiscount = calculateDiscount(
          Number(billValue),
          Number(claimedCoins),
          Number(total),
        );
      }
      await PaymentAlert.create({
        businessId: businessId,
        alertType: "OFFLINE",
        order_id: saveOrder?._id,
        status: "SUCCESS",
        tableName: tableName,
        coinsApplied: !!(claimedCoins && claimedCoins > 0),
        message: `Paid ${total}`,
        date: Date.now(),
        posDiscount: posDiscount,
      });

      return respond(c, "Order created successfully", false, 200, {
        order_id: saveOrder?._id,
      });
    },
  )
  .post(
    "/validPayment",

    zValidator("json", validatePaymentSchema),

    async (c) => {
      const requestData = await c.req.json();
      const { response } = requestData;
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        response;

      const signature = createHmac("sha256", Bun.env.RAZORPAY_SECRET as string)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (signature === razorpay_signature) {
        return c.json({
          err: false,
          message: "Payment is valid",
          data: razorpay_order_id,
        });
      }
      return c.json({ err: true, message: "Payment is not valid" }, 400);
    },
  )
  .post("/razorpay-webhook", async (c) => {
    //@ts-ignore
    const res = await runInTransaction(async (session: ClientSession) => {
      console.log("yaha tak");

      const headersResult = RazorpayWebhookHeadersSchema.safeParse(
        c.req.header(),
      );
      if (!headersResult.success) {
        return c.json({ err: true, message: "Invalid headers", data: {} }, 200);
      }

      const {
        "x-razorpay-signature": razorpaySignature,
        "x-razorpay-event-id": razorpayEventId,
      } = headersResult.data;

      console.log("razorpaySignature", razorpaySignature);

      const body = await c.req.json();

      const isSignatureValid = validateWebhookSignature(
        JSON.stringify(body),
        razorpaySignature,
        Bun.env.RAZORPAY_WEBHOOK_SECRET as string,
      );
      if (!isSignatureValid) {
        console.log("Invalid signature");
        return c.json(
          { err: true, message: "Invalid signature", data: {} },
          200,
        );
      }

      const bodyResult = RazorpayWebhookBodySchema.safeParse(body);
      if (!bodyResult.success) {
        return c.json({ err: true, message: "Invalid body", data: {} }, 200);
      }
      const { event, payload } = bodyResult.data;

      const getOrder = await Order.findOne(
        { order_id: payload.payment.entity.order_id },
        null,
        { session },
      );
      if (event === "payment.failed") {
        const claimCoins =
          Number(payload.payment.entity.notes.claimedCoins) || 0;
        const alertExist = await PaymentAlert.findOne({
          order_id: getOrder?._id,
        });
        if (!alertExist) {
          await PaymentAlert.create(
            [
              {
                errorReason: payload.payment.entity.error_reason,
                errorDescription: payload.payment.entity.error_description,
                businessId: payload.payment.entity.notes.businessId,
                alertType: "ONLINE",
                order_id: getOrder?._id,
                status: "FAIL",
                tableName: payload.payment.entity.notes.tableName,

                coinsApplied: claimCoins > 0,
                isAccepted: false,
                date: Date.now(),

                message: `Fail ${payload.payment.entity.notes.total}`,
                // comment : payload.payment.entity.notes.comment
              },
            ],
            { session },
          );
        }
      }
      if (event === "payment.captured") {
        const createPayment = await Payment.create(
          [
            {
              businessId: payload.payment.entity.notes.businessId,
              total: payload.payment.entity.notes.total,
              billValue: payload.payment.entity.notes.billValue,
              mode: payload.payment.entity.method,
              userId: getOrder?.userId,
              order_id: getOrder?._id,
              paymentMode: "online",
              tableName: payload.payment.entity.notes.tableName,
              claimedCoins: payload.payment.entity.notes.claimedCoins || 0,
              tips: payload.payment.entity.notes.tips || 0,
              razorpayPaymentId: payload.payment.entity.id,
              razorpayOrderId: payload.payment.entity.order_id,
              razorpayAcquirerData: payload.payment.entity.acquirer_data,
              razorpayEventId: razorpayEventId,
              date: Date.now(),
            },
          ],
          { session },
        );

        const claimCoins = Number(payload.payment.entity.notes.claimedCoins);
        await PaymentAlert.updateMany(
          { tableName: getOrder?.tableName },
          { isAccepted: true },
          { session },
        );
        let posDiscount = 0;
        if (claimCoins > 0) {
          posDiscount = calculateDiscount(
            Number(payload.payment.entity.notes.billValue),
            claimCoins,
            Number(payload.payment.entity.notes.total),
          );
        }
        await PaymentAlert.create(
          [
            {
              businessId: payload.payment.entity.notes.businessId,
              alertType: "ONLINE",
              payment_id: createPayment[0]._id,
              coinsApplied: claimCoins > 0,
              status: "SUCCESS",
              order_id: getOrder?._id,
              message: `Paid ${payload.payment.entity.notes.total}`,
              tableName: payload.payment.entity.notes.tableName,
              isAccepted: false,
              posDiscount: posDiscount,
              date: Date.now(),
            },
          ],
          { session },
        );
        if (payload.payment.entity.notes.loyaltyId) {
          if (claimCoins > 0) {
            await removeCoins(
              Number(payload.payment.entity.notes.claimedCoins),
              payload.payment.entity.notes.tableName,
              payload.payment.entity.notes.loyaltyId,
              getOrder?._id.toString() ?? "",
              getOrder?.userId?.toString() ?? "",
              session,
            );
          }

          const cashBack = await calculatedCashbackCoins(
            payload.payment.entity.notes.businessId,
            Number(payload.payment.entity.notes.billValue),
            Number(payload.payment.entity.notes.claimedCoins),
          );

          const cashBackCoins = await addCoins(
            cashBack,
            getOrder?.userId?.toString() ?? "",
            getOrder?._id?.toString() ?? "",
            payload.payment.entity.notes.tableName || "",
            payload.payment.entity.notes.businessId || "",
            payload.payment.entity.notes.loyaltyId || "",

            session,
          );

          await LoyaltyCoinsInfo.findOneAndUpdate(
            { businessId: payload.payment.entity.notes.businessId },

            {
              $inc: {
                coinzIssued: cashBackCoins,
                coinzRedeemed: claimCoins,
              },
            },
            { upsert: true, session },
          );
        }
      }
    });

    return c.json({
      err: false,
      message: "Webhook processed successfully",
      data: res,
    });
  })

  .post(
    "/createWaiterAlert",
    zValidator("json", PaymentAlertSchema),

    async (c) => {
      const requestData = await c.req.json();
      const { businessId, tableName, message, userId } = requestData;

      const alert = await PaymentAlert.create({
        businessId: businessId,
        alertType: "WAITER",
        userId: userId,
        status: "SUCCESS",
        tableName: tableName,
        message: message,
        date: Date.now(),
      });
      return respond(c, "Alert created successfully", false, 200, alert);
    },
  )
  .get(
    "/:id/paymentAlerts",

    zValidator("query", paramsSchema),

    async (c) => {
      const { businessId, alertType } = c.req.query();

      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        alertType,
        isAccepted: false,
      })
        .sort({ _id: -1 })
        .populate("order_id");

      return respond(c, "existing payment", false, 200, existingPaymentAlerts);
    },
  )
  .get(
    "/:id/orders",
    zValidator("query", paramsSchema),
    // ,
    async (c) => {
      const { businessId } = c.req.query();
      const existingOrders = await Order.find({ businessId });

      return respond(c, "existing orders", false, 200, existingOrders);
    },
  )
  .get(
    "/:id/orders/:orderId",

    zValidator("query", paramsSchema),

    async (c) => {
      const { businessId, alertType } = c.req.query();

      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        alertType,
        isAccepted: false,
      })
        .sort({ _id: -1 })
        .populate("order_id");

      return c.json({
        data: existingPaymentAlerts,
        status: 200,
        err: false,
      });
    },
  )
  .get(
    "/:id/offlineAlerts",

    zValidator("query", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.query();

      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        alertType: ["OFFLINE", "WAITER"],
        isAccepted: false,
      })
        .sort({ _id: -1 })
        .populate("order_id");

      return respond(c, "existing payment", false, 200, existingPaymentAlerts);
    },
  )
  .put(
    "/:pid/order/:alertId",

    zValidator("param", z.object({ alertId: z.string() })),

    zValidator("json", acceptOrderSchema),
    async (c) => {
      const { alertId } = c.req.param();
      const requestData = await c.req.json();
      const { comment, waiterName } = requestData;
      //@ts-ignore
      const res = await runInTransaction(async (session: ClientSession) => {
        const alert = await PaymentAlert.findOne(
          { _id: alertId, isAccepted: false },
          null,
          { session },
        ).select("_id alertType isAccepted order_id businessId");

        if (!alert) {
          return c.json({ message: "Alert not found", err: true, data: {} });
        }

        if (alert.alertType === "ONLINE" || alert.alertType === "WAITER") {
          const updateAlert = await PaymentAlert.findByIdAndUpdate(
            alertId,
            { isAccepted: true, comment, waiterName },
            { new: true, session },
          ).populate("order_id");
          return c.json({
            message: "Order accepted successfully",
            err: false,
            data: updateAlert,
          });
        }

        if (alert.alertType === "OFFLINE") {
          console.log("arra");
          if (alert && !alert.isAccepted) {
            const order = await Order.findById(alert.order_id, null, {
              session,
            });

            await Payment.create(
              [
                {
                  businessId: alert.businessId,
                  order_id: order?._id,
                  total: order?.total,
                  mode: "offline",
                  status: "SUCCESS",
                  paymentMode: "offline",
                  userId: order?.userId,
                  claimedCoins: order?.claimedCoins,
                  billValue: order?.billValue,
                  tips: order?.tips,
                  tableName: order?.tableName,
                  waiterName,
                  date: Date.now(),
                },
              ],
              { session },
            );

            if (order?.claimedCoins && order?.claimedCoins > 0) {
              const existingLoyalty = await LoyaltySettings.findOne({
                businessId: alert.businessId,
              }).select("loyaltyId");
              await removeCoins(
                Number(order?.claimedCoins),
                order.tableName || "",
                existingLoyalty?.loyaltyId.toString() || "",
                order._id.toString(),
                order.userId.toString(),

                session,
              );
            }

            if (order) {
              const cashBack = await calculatedCashbackCoins(
                order.businessId.toString(),
                Number(order.billValue),
                Number(order.claimedCoins),
              );
              const existingLoyalty = await LoyaltySettings.findOne({
                businessId: alert.businessId,
              }).select("loyaltyId");
              await addCoins(
                cashBack,
                order.userId.toString(),
                order._id.toString(),
                order.tableName || "",
                order.businessId.toString(),

                existingLoyalty?.loyaltyId.toString() || "",

                session,
              );

              await LoyaltyCoinsInfo.findOneAndUpdate(
                { businessId: order.businessId.toString() },

                {
                  $inc: {
                    coinzIssued: cashBack,
                    coinzRedeemed: Number(order.claimedCoins),
                  },
                },
                { upsert: true, session },
              );
            }
          }

          const updateAlert = await PaymentAlert.findByIdAndUpdate(
            alertId,
            { isAccepted: true, comment, waiterName },
            { new: true, session },
          ).populate("order_id");

          return c.json({
            message: "Order accepted successfully",
            err: false,
            data: updateAlert,
          });
        }
        return c.json({ message: "Invalid alert type", err: true, data: {} });
      });

      return c.json({
        message: "Order accepted successfully",
        err: false,
        data: res,
      });
    },
  )
  .put(
    "/:pid/rejectOrder/:alertId",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.CAPTAIN]),
    zValidator("param", paramsSchema),

    zValidator("json", acceptOrderSchema),

    async (c) => {
      const { alertId } = c.req.param();
      const requestData = await c.req.json();
      const { waiterName } = requestData;

      const updateAlert = await PaymentAlert.findByIdAndUpdate(
        alertId,
        { isRejected: true, isAccepted: true, waiterName },
        { new: true },
      ).populate("order_id");

      if (!updateAlert)
        return c.json({ message: "Alert not found", err: true, data: {} });

      return c.json({
        message: "Order rejected successfully",
        err: false,
        data: updateAlert,
      });
    },
  )
  .get(
    "/:id/paymentAlertHistory",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.CAPTAIN]),
    zValidator("query", paramsSchema),

    async (c) => {
      const { businessId, from, to } = c.req.query();
      const fromDate = Number(from);
      const toDate = Number(to);
      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;
      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }
      if (!from && !to) {
        const existingPaymentAlerts = await PaymentAlert.find({
          businessId,
          isAccepted: true,
          isRejected: false,
          date: {
            $gte: startOfToday.getTime(),
            $lte: endOfToday.getTime(),
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate("order_id");

        return c.json({
          data: existingPaymentAlerts,
          status: 200,
          err: false,
        });
      }

      if (from && to) {
        const existingPaymentAlerts = await PaymentAlert.find({
          businessId,
          isAccepted: true,
          isRejected: false,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate("order_id");

        return c.json({
          data: existingPaymentAlerts,
          status: 200,
          err: false,
        });
      }
      return c.json({
        err: true,
        data: {},
        message: "Invalid date range",
      });
    },
  )
  .get(
    "/:id/salesDashboard",

    zValidator("query", paramsSchema),

    async (c) => {
      const { businessId, from, to } = c.req.query();
      const fromDate = Number(from);
      const toDate = Number(to);
      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const loyaltyCoinInfo = await LoyaltyCoinsInfo.findOne({
        businessId,
      }).select("coinzIssued coinzRedeemed");
      const {
        billingStartToday,
        billingEndToday,
        billingStartYesterday,
        billingEndYesterday,
      } = getBillingPeriod(18);

      const startDate = billingStartYesterday;
      const endDate = billingEndToday;

      console.log("startDate", startDate, "endDate", endDate);

      if (!from && !to) {
        const existingPayments = await Payment.find({
          businessId,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        }).select("total claimedCoins paymentMode");
        const totalSale = existingPayments.reduce(
          (acc, payment: PaymentType) => acc + (payment.total ?? 0),
          0,
        );
        const totalCoins = existingPayments.reduce(
          (acc, payment: PaymentType) => acc + (payment?.claimedCoins ?? 0),
          0,
        );

        const totalOnlineSale = existingPayments.reduce(
          (acc, payment: PaymentType) =>
            acc + (payment.paymentMode === "online" ? payment.total ?? 0 : 0),
          0,
        );

        const totalOfflineSale = existingPayments.reduce(
          (acc, payment: PaymentType) =>
            acc + (payment.paymentMode === "offline" ? payment.total ?? 0 : 0),
          0,
        );

        return c.json({
          err: false,
          data: {
            totalSale,
            totalDiscount: totalCoins,
            totalOnlineSale,
            totalOfflineSale,
            coinzIssued: loyaltyCoinInfo?.coinzIssued,
            coinzRedeemed: totalCoins,
          },
          message: "existing payment",
        });
      }
      if (from && to) {
        const existingPayments = await Payment.find({
          businessId,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        }).select("total claimedCoins paymentMode");
        const totalSale = existingPayments.reduce(
          (acc, payment: PaymentType) => acc + (payment.total ?? 0),
          0,
        );
        const totalCoins = existingPayments.reduce(
          (acc, payment: PaymentType) => acc + (payment?.claimedCoins ?? 0),
          0,
        );

        const totalOnlineSale = existingPayments.reduce(
          (acc, payment: PaymentType) =>
            acc + (payment.paymentMode === "online" ? payment.total ?? 0 : 0),
          0,
        );

        const totalOfflineSale = existingPayments.reduce(
          (acc, payment: PaymentType) =>
            acc + (payment.paymentMode === "offline" ? payment.total ?? 0 : 0),
          0,
        );

        return c.json({
          err: false,
          data: {
            totalSale,
            totalDiscount: totalCoins,
            totalOnlineSale,
            totalOfflineSale,
            coinzIssued: loyaltyCoinInfo?.coinzIssued,
            coinzRedeemed: totalCoins,
          },
          message: "existing payment",
        });
      }
      return c.json({
        err: true,
        data: {},
        message: "Invalid date range",
      });
    },
  )

  .get(
    "/:id/bills",

    zValidator("query", paramsSchema),

    async (c) => {
      const { businessId, from, to } = c.req.query();
      const fromDate = Number(from);
      const toDate = Number(to);
      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;

      if (!from && !to) {
        const existingPayments = await Payment.find({
          businessId,
          date: {
            $gte: startOfToday.getTime(),
            $lte: endOfToday.getTime(),
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate("order_id");
        const totalSale = existingPayments.reduce(
          (acc, payment) => acc + (payment.total ?? 0),
          0,
        );

        return c.json({
          err: false,
          data: {
            totalSale,
            existingPayments,
          },
          message: "existing payment",
        });
      }
      if (from && to) {
        const existingPayments = await Payment.find({
          businessId,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate("order_id");
        const totalSale = existingPayments.reduce(
          (acc, payment) => acc + (payment.total ?? 0),
          0,
        );

        return c.json({
          err: false,
          data: {
            totalSale,
            existingPayments,
          },
          message: "existing payment",
        });
      }
      return c.json({
        err: true,
        data: {},
        message: "Invalid date range",
      });
    },
  );

export default paymentsRouter;
