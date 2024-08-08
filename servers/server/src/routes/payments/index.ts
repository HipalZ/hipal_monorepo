import { createHmac } from "node:crypto";
// books.ts
import {
  BusinessSettings,
  GroupAnalytic,
  LoyaltyCoinsInfo,
  LoyaltySettings,
  Order,
  Payment,
  PaymentAlert,
  Reviews,
  Subscriber,
  TagModel,
  User,
  UserAnalytic,
  UserReward,
  UserRewardHistory,
  UserTags,
} from "@hi/db-models";
import type { PaymentType } from "@hi/db-models/src/validators";
import {
  RazorpayWebhookBodySchema,
  RazorpayWebhookHeadersSchema,
  ReviewsSchema,
  acceptOrderSchema,
  paramsSchema,
  razorpayOrderSchema,
  validatePaymentSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { ObjectId } from "bson";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import { schedule } from "node-cron";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { getMerchantConfig } from "../../utils/cacheHelper";
import {
  type MerchantConfig,
  razorpayWrapper,
} from "../../utils/razorpay-wrapper";
import { respond } from "../../utils/response";
const { validateWebhookSignature } = require("../../utils/razorpay-utils");
const transformData = (data: any[]) => {
  return data
    .filter((item) => item.groupId != null) // Filter out items with null groupId
    .map((item) => {
      const filter = item.groupId.filter[0]; // Assuming there's only one filter object

      return {
        duration: filter?.duration || 0,
        visitCount: filter?.visit || 0,
        visitType: filter?.visitType,
        spendAmount: filter?.spend || 0,
        spendType: filter?.spendType,
        cardBalance: filter?.cardBalance || 0,
        cardBalanceType: filter?.cardBalanceType,
        coinzIssued: filter?.coinzIssued || 0,
        coinzIssuedType: filter?.coinzIssuedType,
        coinzUsed: filter?.coinzUsed || 0,
        coinzUsedType: filter?.coinzUsedType,
        userCount: item.userCount || 0,
        userPercentage: item.userPercentage || 0,
        groupColor: item.groupId.groupColor || "",
        groupName: item.groupId.name || "",
      };
    });
};
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

//filter groups

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
  const existingUser = await UserReward.findOne({ userId, loyaltyId }).select(
    "rewards",
  );

  const existingLoyalty = await LoyaltySettings.findOne({
    businessId: businessId,
  }).select("rewardLimit");
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
    );

    if (coinsCalculated.finalReward > 0) {
      console.log("useeeeeid", userId);
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

  console.log("LoyaltySetting", businessId);
  if (!LoyaltySetting) {
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

const totalSubscribers = async (businessId: string) => {
  const subscribers = await Subscriber.find({
    isDeleted: false,
    businessId,
  }).select("userCount");

  const totalUserCount = subscribers.reduce(
    (acc, sub) => acc + (sub.userCount ?? 0),
    0,
  );

  return totalUserCount;
};

const calculatePercentages = (totalReviewsLength: number, count: number) => {
  return Math.round((count / totalReviewsLength) * 100);
};

const fetchData = async (
  businessId: string,
  fromDate: number,
  toDate: number,
) => {
  const existingPayments = await Payment.find({
    businessId,
    date: {
      $gte: fromDate,
      $lte: toDate,
    },
  });

  const totalSpend = existingPayments.reduce(
    (acc, payment) => acc + (payment.total ?? 0),
    0,
  );

  const averageSpend = Math.round(totalSpend / existingPayments.length);

  const totalReviews = await Reviews.find({
    businessId,
    date: {
      $gte: fromDate,
      $lte: toDate,
    },
  });

  const totalReviesCount = totalReviews.reduce(
    (acc, review) => acc + (review.reviewRating ?? 0),
    0,
  );

  const avgRating = Math.round(totalReviesCount / totalReviews.length);

  const newUsers = await Subscriber.find({
    businessId,
    date: {
      $gte: fromDate,
      $lte: toDate,
    },
    userCount: { $eq: 1 },
  });

  const countOfFoodTaste = totalReviews.filter(
    (review) => review.foodTaste === 1,
  ).length;
  const countOfBadFoodTaste = totalReviews.filter(
    (review) => review.foodTaste === 0,
  ).length;

  const countOfAmbience = totalReviews.filter(
    (review) => review.ambience === 1,
  ).length;
  const countOfBadAmbience = totalReviews.filter(
    (review) => review.ambience === 0,
  ).length;

  const countOfHygiene = totalReviews.filter(
    (review) => review.hygiene === 1,
  ).length;
  const countOfBadHygiene = totalReviews.filter(
    (review) => review.hygiene === 0,
  ).length;
  const countOfService = totalReviews.filter(
    (review) => review.service === 1,
  ).length;
  const countOfBadService = totalReviews.filter(
    (review) => review.service === 0,
  ).length;

  return {
    totalSpend,
    averageSpend,
    avgRating,
    newUsers,
    totalReviews,
    countOfFoodTaste,
    countOfBadFoodTaste,
    countOfAmbience,
    countOfBadAmbience,
    countOfHygiene,
    countOfBadHygiene,
    countOfService,
    countOfBadService,
  };
};

function calculateTimestamps(days: number): {
  fromTimestamp: number;
  toTimestamp: number;
} {
  const currentDate = new Date();
  const toTimestamp = currentDate.getTime();

  const fromDate = new Date();
  fromDate.setDate(currentDate.getDate() - days);
  const fromTimestamp = fromDate.getTime();

  return { fromTimestamp, toTimestamp };
}

const paymentsRouter = new Hono()
  .post(
    "/createOrder/:merchantId",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),
    zValidator("json", razorpayOrderSchema),
    zValidator("param", z.object({ merchantId: z.string() })),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        console.log("createOrder");
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
        const { merchantId } = c.req.param();
        const uniqueOrderId = nanoid(15);
        const client = await razorpayWrapper.getClient(merchantId);
        const response = await client.orders.create({
          amount: total * 100, // Fixed multiplication logic
          currency: currency,
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
        if (!saveOrder || !response)
          return respond(c, "Order not created", true, 400, {});

        return respond(c, "Order created successfully", false, 200, {
          order_id: response.id,
        });
      });
    },
  )
  .post(
    "/reviews",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),
    zValidator("json", ReviewsSchema),

    async (c) => {
      const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
      const { order_id } = requestData || {};

      const review = await Reviews.findOne({ order_id: order_id });

      if (review) return respond(c, "Review already exists", true, 400, {});

      const addReview = await Reviews.create(requestData);

      if (!addReview) return respond(c, "Review not created", true, 400, {});

      await Payment.findOneAndUpdate(
        { razorpayOrderId: order_id },
        { reviewId: addReview._id },
      );

      return respond(c, "Review created successfully", false, 200, addReview);
    },
  )
  .post(
    "/createOfflineOrder",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),

    zValidator("json", razorpayOrderSchema),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
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

        const saveOrder = await Order.create(
          [
            {
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
            },
          ],
          { session },
        );
        if (!saveOrder) return respond(c, "Order not created", true, 400, {});
        let posDiscount = 0;
        if (Number(claimedCoins) > 0) {
          posDiscount = calculateDiscount(
            Number(billValue),
            Number(claimedCoins),
            Number(total),
          );
        }
        await PaymentAlert.create(
          [
            {
              businessId: businessId,
              userId: userId,
              alertType: "OFFLINE",
              order_id: saveOrder?.[0]._id,
              status: "SUCCESS",
              tableName: tableName,
              coinsApplied: !!(claimedCoins && claimedCoins > 0),
              message: `Paid ${total}`,
              date: Date.now(),
              posDiscount: posDiscount,
            },
          ],
          { session },
        );

        return respond(c, "Order created successfully", false, 200, {
          order_id: saveOrder?.[0]._id,
        });
      });
    },
  )
  .post(
    "/validPayment/:merchantId",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),
    zValidator("json", validatePaymentSchema),
    zValidator("param", z.object({ merchantId: z.string() })),

    async (c) => {
      const requestData = await c.req.json();
      const { response } = requestData;
      const { merchantId } = c.req.param();
      const merchantConfig = (await getMerchantConfig(
        merchantId,
      )) as MerchantConfig;
      let RAZORPAY_SECRET = "";

      if (!merchantConfig) {
        const merchant = await BusinessSettings.findOne({
          razorpayMerchantId: merchantId,
        }).select("razorpayKeySecret");
        RAZORPAY_SECRET = merchant?.razorpayKeySecret as string;
      } else {
        RAZORPAY_SECRET = merchantConfig.razorpayKeySecret;
      }

      if (!RAZORPAY_SECRET)
        return respond(
          c,
          "razorpay_secret missing while validating payments",
          true,
          400,
          {},
        );

      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        response;

      const signature = createHmac("sha256", RAZORPAY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (signature === razorpay_signature) {
        return c.json({
          err: false,
          message: "Payment is valid",
          data: razorpay_order_id,
        });
      }
      return c.json(
        {
          err: true,
          message: "Payment is invalid",
          data: {},
        },
        400,
      );
    },
  )
  .post("/razorpay-webhook/:merchantId", async (c) => {
    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const { merchantId } = c.req.param();
      const merchantConfig = (await getMerchantConfig(
        merchantId,
      )) as MerchantConfig;

      let RAZORPAY_WEBHOOK_SECRET = "";
      const body = await c.req.json();
      if (!merchantConfig) {
        const merchant = await BusinessSettings.findOne({
          razorpayMerchantId: merchantId,
        }).select("razorpayWebhookSecret");
        RAZORPAY_WEBHOOK_SECRET = merchant?.razorpayWebhookSecret || "";
      } else {
        RAZORPAY_WEBHOOK_SECRET = merchantConfig.razorpayWebhookSecret;
      }

      if (!RAZORPAY_WEBHOOK_SECRET) {
        console.log("razorpay_webhook_secret missing");
      }

      const headersResult = RazorpayWebhookHeadersSchema.safeParse(
        c.req.header(),
      );
      if (!headersResult.success) {
        throw new Error("Invalid headers");
      }

      const {
        "x-razorpay-signature": razorpaySignature,
        "x-razorpay-event-id": razorpayEventId,
      } = headersResult.data;

      const isSignatureValid = validateWebhookSignature(
        JSON.stringify(body),
        razorpaySignature,
        RAZORPAY_WEBHOOK_SECRET,
      );
      if (!isSignatureValid) {
        console.log("Invalid signature");
        throw new Error("Invalid signature");
      }

      const bodyResult = RazorpayWebhookBodySchema.safeParse(body);
      if (!bodyResult.success) {
        throw new Error("Invalid body");
      }
      const { event, payload } = bodyResult.data;

      const getOrder = await Order.findOne({
        order_id: payload.payment.entity.order_id,
      });

      if (event === "payment.failed") {
        const claimCoins =
          Number(payload.payment.entity.notes.claimedCoins) || 0;
        const alertExist = await PaymentAlert.findOne({
          order_id: getOrder?._id,
          status: "FAIL",
          alertType: "ONLINE",
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
                userId: getOrder?.userId,
                status: "FAIL",
                tableName: payload.payment.entity.notes.tableName,
                coinsApplied: claimCoins > 0,
                isAccepted: false,
                date: Date.now(),
                message: `Fail ${payload.payment.entity.notes.total}`,
              },
            ],
            { session },
          );
        }
      }

      if (event === "payment.captured") {
        const paymentAlreadyExist = await Payment.findOne({
          razorpayEventId: razorpayEventId,
        });

        if (!paymentAlreadyExist && getOrder) {
          const claimCoins = Number(getOrder?.claimedCoins) || 0;
          await PaymentAlert.updateOne(
            {
              tableName: getOrder?.tableName,
              isAccepted: false,
              alertType: "OFFLINE",
            },
            { isAccepted: true, isRejected: true },
            { session },
          );
          let posDiscount = 0;
          if (claimCoins > 0) {
            posDiscount = calculateDiscount(
              Number(getOrder?.billValue),
              claimCoins,
              Number(getOrder?.total),
            );
          }

          let getCashBack = 0;

          if (payload.payment.entity.notes.loyaltyId) {
            if (claimCoins > 0) {
              await removeCoins(
                claimCoins,
                getOrder?.tableName || "",
                payload.payment.entity.notes.loyaltyId || "",
                getOrder?._id.toString() || "",
                getOrder?.userId.toString() || "",
                session,
              );
            }

            const cashBack = await calculatedCashbackCoins(
              getOrder?.businessId.toString() || "",
              getOrder?.billValue || 0,
              claimCoins,
            );

            const cashBackCoins = await addCoins(
              cashBack,
              getOrder?.userId.toString() || "",
              getOrder?._id.toString() || "",

              getOrder?.tableName || "",
              getOrder?.businessId.toString() || "",
              payload.payment.entity.notes.loyaltyId || "",

              session,
            );

            getCashBack = cashBackCoins;

            const userAnalytics = await UserAnalytic.findOne({
              userId: getOrder?.userId,
            }).select("totalSpend");
            if (userAnalytics) {
              const countAvgSpend = Math.round(
                userAnalytics.totalSpend || 0 + userAnalytics.visitCount || 0,
              );
              await UserAnalytic.findOneAndUpdate(
                { userId: getOrder?.userId },
                {
                  $inc: {
                    totalSpend: getOrder.total,
                    visitCount: 1,
                    coinzIssued: cashBackCoins,
                    coinzUsed: claimCoins,
                  },
                  $set: { avgSpend: countAvgSpend },
                },
                { session },
              );
            } else {
              await UserAnalytic.create(
                [
                  {
                    userId: getOrder?.userId,
                    businessId: getOrder?.businessId,
                    visitCount: 1,
                    totalSpend: getOrder.total,
                    avgSpend: getOrder.total,
                    dateOfJoining: Date.now(),
                    coinzIssued: cashBackCoins,
                    coinzUsed: claimCoins,
                  },
                ],
                { session },
              );
            }
          }
          console.log("getCashBack", getCashBack);

          const createPayment = await Payment.create(
            [
              {
                businessId: getOrder?.businessId,
                total: getOrder?.total,
                billValue: getOrder?.billValue,
                mode: payload.payment.entity.method,
                userId: getOrder?.userId,
                order_id: getOrder?._id,
                paymentMode: "online",
                tableName: getOrder?.tableName,
                claimedCoins: getOrder?.claimedCoins,
                tips: getOrder?.tips,
                razorpayPaymentId: payload.payment.entity.id,
                razorpayOrderId: payload.payment.entity.order_id,
                razorpayAcquirerData: payload.payment.entity.acquirer_data,
                razorpayEventId: razorpayEventId,
                earnCoins: getCashBack,
                date: Date.now(),
              },
            ],
            { session },
          );

          await PaymentAlert.create(
            [
              {
                businessId: getOrder?.businessId,
                alertType: "ONLINE",
                payment_id: createPayment[0]._id,
                coinsApplied: claimCoins > 0,
                status: "SUCCESS",
                order_id: getOrder?._id,
                message: `Paid ${getOrder?.total}`,
                tableName: getOrder?.tableName,
                isAccepted: false,
                userId: getOrder?.userId,
                posDiscount: posDiscount,
                date: Date.now(),
              },
            ],
            { session },
          );
        }
      }

      return respond(c, "Webhook received successfully", false, 200, {});
    });
  })

  .post(
    "/createWaiterAlert",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),
    zValidator(
      "json",
      z.object({
        businessId: z.string(),
        alertType: z.enum(["WAITER"]),
        tableName: z.string(),
        message: z.string(),
        userId: z.string(),
      }),
    ),

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
        order_id: new ObjectId(),
      });
      return respond(c, "Alert created successfully", false, 200, alert);
    },
  )
  .get(
    "/:id/paymentAlerts",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),

    zValidator("query", paramsSchema),

    async (c) => {
      const { businessId, alertType } = c.req.query();

      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        alertType,
        isAccepted: false,
      })
        .sort({ _id: -1 })
        .populate({
          path: "order_id",
        })
        .populate({
          path: "userId",
          select: "name phone",
        });

      return respond(
        c,
        "existing paymentAlert",
        false,
        200,
        existingPaymentAlerts,
      );
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
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),

    zValidator("query", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.query();

      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        alertType: ["OFFLINE", "WAITER"],
        isAccepted: false,
      })
        .sort({ _id: -1 })
        .populate({
          path: "order_id",
        })
        .populate({
          path: "userId",
          select: "name phone",
        });

      return respond(
        c,
        "existing paymentAlert",
        false,
        200,
        existingPaymentAlerts,
      );
    },
  )
  .put(
    "/:pid/order/:alertId",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),

    zValidator("param", z.object({ alertId: z.string() })),

    zValidator("json", acceptOrderSchema),
    async (c) => {
      const { alertId } = c.req.param();
      const requestData = await c.req.json();
      const { comment, waiterName } = requestData;
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const alert = await PaymentAlert.findOne(
          { _id: alertId, isAccepted: false },
          null,
          { session },
        ).select("_id alertType isAccepted order_id businessId userId");

        if (!alert) {
          return c.json({ message: "Alert not found", err: true, data: {} });
        }
        const existingLoyalty = await LoyaltySettings.findOne({
          businessId: alert.businessId,
        }).select("loyaltyId");

        if (alert.alertType === "ONLINE" || alert.alertType === "WAITER") {
          const updateAlert = await PaymentAlert.findByIdAndUpdate(
            alertId,
            { isAccepted: true, comment, waiterName },
            { new: true, session },
          );
          return c.json({
            message: "Order accepted successfully",
            err: false,
            data: updateAlert,
          });
        }

        if (alert.alertType === "OFFLINE") {
          if (alert && !alert.isAccepted) {
            const order = await Order.findById(alert.order_id);
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
                  razorpayEventId: nanoid(15),
                  razorpayOrderId: nanoid(15),
                  razorpayPaymentId: nanoid(15),

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

              console.log("userId", order.userId.toString());

              const finalCashBack = await addCoins(
                cashBack,
                order.userId.toString(),
                order._id.toString(),
                order.tableName || "",
                order.businessId.toString(),

                existingLoyalty?.loyaltyId.toString() || "",

                session,
              );

              const userAnalytics = await UserAnalytic.findOne({
                userId: order?.userId,
              }).select("totalSpend");
              if (userAnalytics) {
                const countAvgSpend = Math.round(
                  userAnalytics.totalSpend || 0 + userAnalytics.visitCount || 0,
                );
                await UserAnalytic.findOneAndUpdate(
                  { userId: order?.userId },
                  {
                    $inc: {
                      totalSpend: order?.total,
                      visitCount: 1,
                      coinzIssued: finalCashBack || 0,
                      coinzUsed: order?.claimedCoins || 0,
                    },
                    $set: { avgSpend: countAvgSpend },
                  },
                  { session },
                );
              } else {
                await UserAnalytic.create(
                  [
                    {
                      userId: order?.userId,
                      businessId: order?.businessId,
                      visitCount: 1,
                      totalSpend: order?.total,
                      avgSpend: order?.total,
                      dateOfJoining: Date.now(),
                      coinzIssued: finalCashBack || 0,
                      coinzUsed: order?.claimedCoins || 0,
                    },
                  ],
                  { session },
                );
              }

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
          );

          return c.json({
            message: "Order accepted successfully",
            err: false,
            data: updateAlert,
          });
        }
        return c.json({ message: "Invalid alert type", err: true, data: {} });
      });
    },
  )
  .put(
    "/:pid/rejectOrder/:alertId",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),
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
      );

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
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),
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
          .populate({
            path: "order_id",
          })
          .populate({
            path: "userId",
            select: "name phone",
          });

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
          .populate({
            path: "order_id",
          })
          .populate({
            path: "userId",
            select: "name phone",
          });

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
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),

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

      if (!from && !to) {
        const existingPayments = await Payment.find({
          businessId,
          date: {
            $gte: startOfToday.getTime(),
            $lte: endOfToday.getTime(),
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
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),

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
          .populate({
            path: "order_id",
          })
          .populate({
            path: "userId",
            select: "name phone",
          });
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
          .populate({
            path: "order_id",
          })
          .populate({
            path: "userId",
            select: "name phone",
          });
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
  )
  .put(
    "updateAll/payments",

    zValidator("query", z.object({ update: z.string().optional() })),

    async (c) => {
      // Fetch all payments with paymentMode "offline" and paymentEventId null
      const { update } = c.req.query();
      const existingPayments = await Payment.find({
        razorpayEventId: null,
      });

      if (update === "true") {
        for (const payment of existingPayments) {
          await Payment.findByIdAndUpdate(payment._id, {
            razorpayEventId: nanoid(15),
            razorpayOrderId: nanoid(15),
            razorpayPaymentId: nanoid(15),
          });
        }
      }

      return c.json({
        err: false,
        data: existingPayments,
        message: "All payments updated successfully",
      });
    },
  )
  .get(
    "/businessDashboard",
    zValidator(
      "query",
      z.object({
        businessId: z
          .string({
            message: "businessId is required",
          })
          .min(24)
          .max(24),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (from && to && fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const groupAnalytics = await GroupAnalytic.find({ businessId })
        .sort({
          date: -1,
        })
        .populate({
          path: "groupId",
          select: {
            name: 1,
            groupColor: 1,
            "filter.duration": 1,
            "filter.visit": 1,
            "filter.visitType": 1,
            "filter.spend": 1,
            "filter.spendType": 1,
            "filter.cardBalance": 1,
            "filter.cardBalanceType": 1,
            "filter.coinzIssued": 1,
            "filter.coinzIssuedType": 1,
            "filter.coinzUsed": 1,
            "filter.coinzUsedType": 1,
          },
        });

      const transformedData = transformData(groupAnalytics);

      const totalSubscriberCount = await totalSubscribers(businessId);

      const {
        averageSpend,
        avgRating,
        newUsers,
        totalReviews,
        countOfFoodTaste,
        countOfBadFoodTaste,
        countOfAmbience,
        countOfBadAmbience,
        countOfHygiene,
        countOfBadHygiene,
        countOfService,
        countOfBadService,
      } = await fetchData(businessId, fromDate, toDate);

      const goodFoodTastePercentage = calculatePercentages(
        totalReviews.length,
        countOfFoodTaste,
      );
      const badFoodTastePercentage = calculatePercentages(
        totalReviews.length,
        countOfBadFoodTaste,
      );

      const goodAmbiencePercentage = calculatePercentages(
        totalReviews.length,
        countOfAmbience,
      );
      const badAmbiencePercentage = calculatePercentages(
        totalReviews.length,
        countOfBadAmbience,
      );

      const goodHygienePercentage = calculatePercentages(
        totalReviews.length,
        countOfHygiene,
      );
      const badHygienePercentage = calculatePercentages(
        totalReviews.length,
        countOfBadHygiene,
      );

      const goodServicePercentage = calculatePercentages(
        totalReviews.length,
        countOfService,
      );
      const badServicePercentage = calculatePercentages(
        totalReviews.length,
        countOfBadService,
      );

      return c.json(
        {
          err: false,
          data: {
            totalSubscriberCount: totalSubscriberCount || 0,
            groups: transformedData || [],
            aboutCustomer: {
              averageSpendAmount: averageSpend || 0,
              averageReturnPercentage: 15,
              averageReviewCount: avgRating || 0,
              newUserCount: newUsers.length || 0,
            },
            userReviews: {
              foodTaste: {
                likePercentage: goodFoodTastePercentage || 0,
                dislikePercentage: badFoodTastePercentage || 0,
              },
              ambience: {
                likePercentage: goodAmbiencePercentage || 0,
                dislikePercentage: badAmbiencePercentage || 0,
              },
              hygiene: {
                likePercentage: goodHygienePercentage || 0,
                dislikePercentage: badHygienePercentage || 0,
              },
              service: {
                likePercentage: goodServicePercentage || 0,
                dislikePercentage: badServicePercentage || 0,
              },
            },
          },
          message: "existing payment",
        },
        200,
      );
    },
  )
  .get(
    "/users/Analytics",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
        dateOfJoining: z.string().optional(),
        avgSpend: z.string().optional(),
        visitCount: z.string().optional(),
        pageNumber: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to, dateOfJoining, avgSpend, visitCount } =
        c.req.query();
      const fromDate = Number(from);
      const toDate = Number(to);
      const joiningDate = Number(dateOfJoining);
      const avgSpendValue = Number(avgSpend);
      const visitCountValue = Number(visitCount);
      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;

      console.log("fromDate", fromDate);

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const sort: Record<string, number> = {};
      if (dateOfJoining) sort.dateOfJoining = joiningDate;
      if (avgSpend) sort.avgSpend = avgSpendValue;
      if (visitCount) sort.visitCount = visitCountValue;
      if (Object.keys(sort).length === 0) sort._id = -1;

      console.log("sort", sort);

      if (!from && !to) {
        const existingUserAnalytics = await UserAnalytic.find({
          businessId,
          date: {
            $gte: startOfToday.getTime(),
            $lte: endOfToday.getTime(),
          },
        })
          .sort(sort)
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate({
            path: "userId",
            select: "name phone",
          });

        return c.json(
          {
            data: existingUserAnalytics,
            message: "existing payment",
            err: false,
          },
          200,
        );
      }

      if (from && to) {
        const existingUserAnalytics = await UserAnalytic.find({
          businessId,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        })
          .sort(sort)
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate("userId");

        return c.json(
          {
            data: existingUserAnalytics,
            message: "existing payment",
            err: false,
          },
          200,
        );
      }

      return c.json({
        err: true,
        data: {},
        message: "Invalid date range",
      });
    },
  )
  .get(
    "/user/userByPhone",
    zValidator(
      "query",
      z.object({
        phone: z
          .string()
          .min(10, { message: "min 10 digit" })
          .max(10, { message: "max 10 digit" }),
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { phone, businessId } = c.req.query();

      // Find the user by phone number
      const user = await User.findOne({ phone }).select("_id");

      if (!user) {
        return c.json({
          err: true,
          data: {},
          message: "User not found",
        });
      }

      // Use the userId from the found user to query the UserAnalytic collection
      const userAnalytic = await UserAnalytic.findOne({
        userId: user._id,
        businessId,
      }).populate({
        path: "userId",
        select: "name phone",
      });

      if (!userAnalytic) {
        return c.json({
          err: true,
          data: {},
          message: "User analytic not found",
        });
      }

      return c.json({
        err: false,
        data: userAnalytic,
        message: "User analytic found",
      });
    },
  )
  .get(
    "/userDashboard",

    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
        pageNumer: z.string().optional(),
        userId: z.string({ message: "userId is required" }),
        coinsUsage: z.string().optional(),
      }),
    ),

    async (c) => {
      const { businessId, from, to, userId } = c.req.query();
      const fromDate = Number(from);
      const toDate = Number(to);

      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;
      const userTotalSale = await UserAnalytic.findOne({ userId })
        .select("totalSpend visitCount avgSpend coinzIssued coinzUsed")
        .populate({
          path: "userId",
          select: "name phone",
        });

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      if (!from && !to) {
        const existingPayments = await Payment.find({
          userId,
          businessId,
          date: {
            $gte: startOfToday.getTime(),
            $lte: endOfToday.getTime(),
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate({
            path: "tagIds",
            select: "name",
          })
          .populate({
            path: "reviewId",
            select: "reviewRating foodTaste ambience hygiene service",
          });

        return c.json({
          err: false,
          data: {
            name: userTotalSale?.userId.name,
            phone: userTotalSale?.userId.phone,
            totalSale: userTotalSale?.totalSpend,
            AvarageSale: userTotalSale?.avgSpend,
            NumOfVisits: userTotalSale?.visitCount,
            NumOfSessions: userTotalSale?.visitCount,
            coinzIssued: userTotalSale?.coinzIssued,
            coinzUsed: userTotalSale?.coinzUsed,
            bill: existingPayments,
          },
          message: "existing payment",
        });
      }

      if (from && to) {
        const existingPayments = await Payment.find({
          userId,
          businessId,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate({
            path: "tagIds",
            select: "name",
          })
          .populate({
            path: "reviewId",
            select: "reviewRating foodTaste ambience hygiene service",
          });

        return c.json({
          err: false,
          data: {
            name: userTotalSale?.userId.name,
            phone: userTotalSale?.userId.phone,
            totalSale: userTotalSale?.totalSpend,
            AvarageSale: userTotalSale?.avgSpend,
            NumOfVisits: userTotalSale?.visitCount,
            NumOfSessions: userTotalSale?.visitCount,
            coinzIssued: userTotalSale?.coinzIssued,
            coinzUsed: userTotalSale?.coinzUsed,
            bill: existingPayments,
          },
          message: "existing payment",
        });
      }

      return c.json(
        {
          err: false,
          data: {},
          message: "invalid date range",
        },
        400,
      );
    },
  )
  .get(
    "/user/coinsUsage",
    zValidator(
      "query",
      z.object({
        loyaltyId: z.string({
          message: "loyaltyId is required",
        }),
        userId: z.string({
          message: "userId is required",
        }),
        from: z.string().optional(),
        to: z.string().optional(),
        pageNumber: z.string().optional(),
      }),
    ),
    async (c) => {
      const { loyaltyId, from, to, userId } = c.req.query();
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
        const existingRewardHistory = await UserRewardHistory.find({
          userId,
          loyaltyId,

          date: {
            $gte: startOfToday.getTime(),
            $lte: endOfToday.getTime(),
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate({
            path: "order_id",
            select: "billValue",
          });

        console.log(
          "existingRewardHistory",
          startOfToday.getTime(),
          endOfToday.getTime(),
        );

        return c.json({
          err: false,
          data: existingRewardHistory,
          message: "existing payment",
        });
      }

      if (from && to) {
        const existingRewardHistory = await UserRewardHistory.find({
          userId,
          loyaltyId,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate({
            path: "order_id",
            select: "billValue",
          });

        console.log(
          "existingRewardHistory",
          startOfToday.getTime(),
          endOfToday.getTime(),
        );

        return c.json({
          err: false,
          data: existingRewardHistory,
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
  .put(
    "/updatePayment/:paymentId",

    zValidator(
      "param",
      z.object({
        paymentId: z.string({
          message: "paymentId is required",
        }),
      }),
    ),

    zValidator(
      "json",
      z.object({
        tagIds: z.array(z.string()).optional(),
        comment: z.string().optional(),
        userId: z.string({
          message: "userId is required",
        }),
        businessId: z.string({
          message: "businessId is required",
        }),
      }),
    ),

    async (c) => {
      const { paymentId } = c.req.param();
      const requestData = await c.req.json();
      const { tagIds, comment, userId, businessId } = requestData;

      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        { $addToSet: { tagIds: { $each: tagIds } }, comment },
        { new: true },
      );

      const user = await User.findById(userId).select("name phone");

      const date = Date.now();
      const customDate = new Date(date).setHours(0, 0, 0, 0);

      for (let i = 0; i < tagIds.length; i++) {
        const tagId = tagIds[i];
        const tag = await TagModel.findById(tagIds[i]).select("duration time");

        const createUserTag = await UserTags.create({
          userId,
          tagId,
          businessId,
          date: Date.now(),
          reminderDate: customDate + tag.duration + tag.time,
        });
        const reminderDateObj = new Date(createUserTag.reminderDate);
        const cronExpression = `${reminderDateObj.getMinutes()} ${reminderDateObj.getHours()} ${reminderDateObj.getDate()} ${
          reminderDateObj.getMonth() + 1
        } *`;

        schedule(cronExpression, async () => {
          const options = {
            method: "POST",
            url: "https://control.msg91.com/api/v5/flow/",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              authkey: "387796AmyGlDBq63b2d75aP1",
            },
            data: {
              template_id: "66b1f189d6fc055e463e3b63",
              sender: "HiPalc",
              mobiles: `91${user.phone}`,
              var: `${user.name}`,
            },
          };
          await axios(options);
        });
      }

      if (!payment) {
        return c.json({
          err: true,
          data: {},
          message: "Payment not found",
        });
      }

      return c.json({
        err: false,
        data: payment,
        message: "Payment updated successfully",
      });
    },
  )
  .get(
    "/tagAndNotes",

    zValidator(
      "query",
      z.object({
        businessId: z.string({
          message: "businessId is required",
        }),
        userId: z.string({
          message: "userId is required",
        }),
      }),
    ),

    async (c) => {
      const { businessId, userId } = c.req.query();

      const existingTagAndNotes = await UserTags.find({
        userId,
        businessId,
      })
        .sort({ _id: -1 })

        .populate({
          path: "tagId",
          select:
            "name tagType displayForCaptains duration time remainderInDuration",
          populate: {
            path: "createdBy",
            select: "name", // Adjust the fields you want to select from the createdBy document
          },
        });

      const groupByTag = existingTagAndNotes.reduce((acc, payment) => {
        if (payment.tagId?._id) {
          const tagIdStr = payment.tagId._id;
          if (!acc[tagIdStr]) {
            acc[tagIdStr] = {
              tagId: payment.tagId,
              // Assuming payment.name contains the name

              count: 0,
            };
          }

          acc[tagIdStr].count += 1;
        }
        return acc;
      }, {});

      return c.json({
        err: false,
        data: Object.values(groupByTag),
        message: "existing tags",
      });
    },
  )
  .post(
    "/getGroupUser",
    zValidator(
      "json",
      z.object({
        userIds: z.array(z.string()),
      }),
    ),
    async (c) => {
      const { userIds = [] } = await c.req.json();
      const users = await UserAnalytic.find({ userId: { $in: userIds } });
      return c.json({
        data: users,
        err: false,
        message: "User found",
      });
    },
  );

export default paymentsRouter;
