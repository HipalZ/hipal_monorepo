import { createHmac } from "node:crypto";
// books.ts
import {
  BusinessPosConfig,
  BusinessSettings,
  CouponClaim,
  Couponz,
  DeviceToken,
  DuesUser,
  GroupAnalytic,
  KotOrder,
  LoyaltySettings,
  NpcUser,
  Order,
  OutLetInfo,
  Payment,
  PaymentAlert,
  PendingDues,
  QrBill,
  Reviews,
  Subscriber,
  Table,
  TempTableSettle,
  UpiMode,
  User,
  UserAnalytic,
  UserCouponClaim,
  UserCouponGrabb,
  UserReward,
  UserRewardHistory,
  UserSession,
  UserTags,
} from "@hi/db-models";
import type { RazorpayWebhookHeaders } from "@hi/db-models/src/validators";
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
import axios from "axios";
import { ObjectId } from "bson";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import Papa from "papaparse";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { ubacMiddleware } from "../../../middleware/checkPermissions";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { getMerchantConfig } from "../../utils/cacheHelper";
import { posApiPaths } from "../../utils/posConfig/petPooja";
import {
  type MerchantConfig,
  razorpayWrapper,
} from "../../utils/razorpay-wrapper";
import { respond } from "../../utils/response";
const admin = require("firebase-admin");
// Hash a passwordss

const { validateWebhookSignature } = require("../../utils/razorpay-utils");
const transformData = (data: unknown[]) => {
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

const calculateDiscount = async (
  businessId: string,
  totalBill: number,
  appliedCoins: number,
) => {
  const outLetInfo = await OutLetInfo.findOne({ businessId }).select(
    "serviceChargePercentage gstPercentage",
  );

  const billValue = totalBill; // bill value
  const serviceChargePercentage =
    (outLetInfo.serviceChargePercentage || 0) / 100; // service charge
  const gstPercentage = (outLetInfo.gstPercentage || 5) / 100; // tax charge
  const coins = appliedCoins; // coins
  const finalBillValue = billValue - coins;

  const estimatedSubTotal =
    billValue / (1 + gstPercentage + serviceChargePercentage);

  const discount = Math.round(
    Math.abs(
      finalBillValue / (1 + gstPercentage + serviceChargePercentage) -
      estimatedSubTotal,
    ),
  );

  return discount;
};

interface SplitMode {
  name: string;
  amount: number;
}

interface AggregatedData {
  totalSale: number;
  forceSettle: number;
  totalTips: number;
  totalTax: number;
  totalServiceCharge: number;
  totalClaimedCoins: number;
  totalEarnCoins: number;
  modeObj: { [key: string]: number };
}

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
    isActive: true,
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
  const LoyaltySetting = await LoyaltySettings.findOne({
    businessId,
    isActive: true,
  }).select("rewardLimit setCashBackPercentage");

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

  return subscribers.length;
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
    isDeleted: false,
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
          couponId,
          channelId,
          cashbackAvailable,
          posBillId,
        } = requestData;
        const { merchantId } = c.req.param();
        const uniqueOrderId = nanoid(15);

        const tableSession = await UserSession.findOne({
          businessId,
          tableName,
        });

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
              billValue: tableSession?.initialTotal || billValue,
              businessId,
              receipt: uniqueOrderId,
              userId,
              claimedCoins: tableSession?.claimedCoins || claimedCoins,
              tableName,
              order_id: response.id,
              tips: tableSession?.tips || tips,
              couponId,
              channelId,
              cashbackAvailable,
              date: Date.now(),
              posBillId,
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
    "/fetch_update_bill/:businessId",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.HIPAL_CUSTOMER]),
    zValidator(
      "json",
      z.object({
        tableName: z.string().min(1).max(20),
        claimedCoins: z.coerce.number().default(0),
        tips: z.coerce.number().optional(),
        total: z.coerce.number(),
        couponId: z.string().optional(),
        removeCoins: z.boolean().optional(),
        removeTips: z.boolean().optional(),
      }),
    ),
    zValidator("param", z.object({ businessId: z.string().min(1).max(50) })),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        try {
          const requestData = await c.req.json();
          let {
            tableName,
            claimedCoins = 0,
            tips = 0,
            couponId,
            removeCoins,
            removeTips,
          } = requestData;
          const { businessId } = c.req.param();
          const tempTable = await UserSession.findOne({
            businessId,
            tableName,
          });
          if (!tempTable) {
            return respond(c, "Table not found", true, 400, {});
          }
          const coupon = await Couponz.findOne({
            _id: couponId,
            businessId,
            isDeleted: false,
          });
          if (coupon) {
            const couponType = coupon?.config?.discountType;
            const initialSubTotal = tempTable?.initialSubTotal;
            if (couponType === "PERCENTAGE") {
              claimedCoins = Math.min(
                Math.round(initialSubTotal * (coupon?.config?.value / 100)),
                coupon?.config?.upto || Number.POSITIVE_INFINITY,
              );
            } else {
              claimedCoins = coupon?.config?.value as number;
            }
          }

          const effectiveClaimedCoins = claimedCoins || tempTable.claimedCoins;

          // Step 1: Calculate finalSubTotal
          const finalSubTotal =
            tempTable.initialSubTotal -
            (removeCoins
              ? 0
              : Math.min(effectiveClaimedCoins, tempTable.initialSubTotal));

          // Step 2: Calculate gstPercentage
          const gstPercentage =
            (tempTable.initialTax / tempTable.initialSubTotal) * 100;

          // Step 3: Calculate finalTax
          const finalTax = (gstPercentage / 100) * finalSubTotal;

          // Step 4: Calculate finalTotal
          const finalTotal = Math.round(
            finalSubTotal +
            finalTax +
            (removeTips ? 0 : tips || tempTable.tips) +
            tempTable.serviceCharge,
          );

          await UserSession.findOneAndUpdate(
            { businessId, tableName },
            {
              finalSubTotal,
              finalTotal,
              couponId: couponId || null,
              finalTax: finalTax.toFixed(2),
              tips: removeTips ? 0 : tips || tempTable.tips,
              claimedCoins: removeCoins ? 0 : effectiveClaimedCoins,
            },
            { session, new: true },
          );

          return c.json(
            {
              message: "Bill updated successfully",
              err: false,
              data: {},
            },
            200,
          );
        } catch (error) {
          console.error("Error updating bill:", error);
          return respond(c, "Internal server error", true, 500, {});
        }
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
      const { order_id } = requestData;

      let order = await Order.findOne({
        order_id,
      });

      if (!order) {
        order = await Order.findOne({
          _id: order_id,
        });
      }

      if (!order) return respond(c, "Order not found", true, 400, {});

      const addReview = await Reviews.create({
        ...requestData,
        order_id: order._id.toString(),
      });

      if (!addReview) return respond(c, "Review not created", true, 400, {});

      await Payment.findOneAndUpdate(
        { razorpayOrderId: order.order_id },
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
          couponId,
          channelId,
          cashbackAvailable,
          posBillId,
        } = requestData;
        const uniqueOrderId = nanoid(15);

        const tableSession = await UserSession.findOne({
          tableName,
          businessId,
        });

        const orderAlreadyExist = await PaymentAlert.findOne({
          businessId,
          tableName,
          alertType: "OFFLINE",
          isAccepted: false,
        });

        if (orderAlreadyExist)
          return respond(
            c,
            "A request for this service is already in progress. Please wait for the staff to take action",
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
              claimedCoins: tableSession?.claimedCoins || claimedCoins,
              tableName,
              tips: tableSession?.tips || tips,
              billValue: tableSession?.initialTotal || billValue,
              businessId,
              order_id: uniqueOrderId,
              couponId,
              channelId,
              cashbackAvailable,
              date: Date.now(),
              posBillId,
            },
          ],
          { session },
        );
        if (!saveOrder) return respond(c, "Order not created", true, 400, {});
        let posDiscount = 0;
        if (Number(tableSession?.claimedCoins || claimedCoins) > 0) {
          posDiscount = await calculateDiscount(
            businessId,
            Number(billValue),
            Number(tableSession?.claimedCoins || claimedCoins),
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
              coinsApplied: !!(
                tableSession?.claimedCoins && tableSession.claimedCoins > 0
              ),
              message: `Paid ${total}`,
              date: Date.now(),
              posDiscount: posDiscount,
              posBillRequestId: tableSession?.billRequestId,
              mode: "OFFLINE",
            },
          ],
          { session },
        );
        const registrationToken = await DeviceToken.find({
          businessId: businessId,
        });

        if (registrationToken.length > 0) {
          for (const obj of registrationToken) {
            if (obj.notification) {
              const pushMessage = {
                token: obj.token, // or use 'topic' if you're sending to a topic
                notification: {
                  title: "Confirm Payment  !!",
                  body: `${tableName} requested to settle bill`,
                },
                android: {
                  notification: {
                    channel_id: "custom_channel_id",
                    sound: "order",
                  },
                },
              };

              admin
                .messaging()
                .send(pushMessage)
                .then((response: unknown) => {
                  return c.json({
                    message: "FCM message sent successfully",
                    err: false,
                    data: response,
                  });
                })
                .catch((err: Error) => {
                  return c.json(
                    {
                      message: "Error sending FCM message",
                      err: true,
                      data: {},
                    },
                    400,
                  );
                });
            }
          }
        }

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
    zValidator(
      "query",
      z.object({
        userId: z.string().optional(),
        couponId: z.string().optional(),
        tableName: z.string().optional(),
        businessId: z.string().optional(),
        paidAmount: z.string().optional(),
      }),
    ),

    async (c) => {
      const requestData = await c.req.json();
      const { response } = requestData;
      const { merchantId } = c.req.param();
      const { userId, couponId, businessId, tableName, paidAmount } =
        c.req.query();
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

      if (userId && couponId) {
        let userClaim = await UserCouponClaim.findOne({ userId, couponId });
        let couponClaim = await CouponClaim.findOne({ couponId });

        const currentDate = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
        const oneMonth = 30 * 24 * 60 * 60 * 1000;

        if (!userClaim) {
          userClaim = await UserCouponClaim.create({
            userId,
            couponId,
            date: currentDate,
            weekelyLastResetDate: currentDate,
            monthlyLastResetDate: currentDate,
            weeklyLimit: 0,
            monthlyLimit: 0,
            overAllLimit: 0,
          });
        }

        if (!couponClaim) {
          couponClaim = await CouponClaim.create({
            couponId,
            date: currentDate,
            weekelyLastResetDate: currentDate,
            monthlyLastResetDate: currentDate,
            weeklyLimit: 0,
            monthlyLimit: 0,
            overAllLimit: 0,
          });
        }

        // Function to reset limits if necessary
        const resetLimitsIfNecessary = (claim, type) => {
          if (
            type === "weekly" &&
            currentDate - claim.weekelyLastResetDate >= oneWeek
          ) {
            claim.weeklyLimit = 0;
            claim.weekelyLastResetDate = currentDate;
          }
          if (
            type === "monthly" &&
            currentDate - claim.monthlyLastResetDate >= oneMonth
          ) {
            claim.monthlyLimit = 0;
            claim.monthlyLastResetDate = currentDate;
          }
        };

        // Reset limits if necessary
        resetLimitsIfNecessary(userClaim, "weekly");
        resetLimitsIfNecessary(userClaim, "monthly");
        resetLimitsIfNecessary(couponClaim, "weekly");
        resetLimitsIfNecessary(couponClaim, "monthly");

        // Function to update limits
        const updateLimits = (claim: {
          overAllLimit: number;
          weeklyLimit: number;
          monthlyLimit: number;
        }) => {
          claim.overAllLimit += 1;
          claim.weeklyLimit += 1;
          claim.monthlyLimit += 1;
        };

        // Update limits
        updateLimits(userClaim);
        updateLimits(couponClaim);

        // Save the updated claims
        await userClaim.save();
        await couponClaim.save();
        const couponz = await Couponz.findById(couponId).select(
          "conditions.individualUserLimit conditions.expiryClaimLimit businessId",
        );

        if (!couponz) {
          return c.json(
            {
              err: true,
              message: "Coupon not found",
              data: razorpay_order_id,
            },
            200,
          );
        }

        const individualUserLimit = couponz?.conditions?.individualUserLimit;
        const expiryClaimLimit = couponz?.conditions?.expiryClaimLimit;
        const userClaimLimit =
          individualUserLimit && "overAllLimit" in individualUserLimit
            ? individualUserLimit.overAllLimit
            : 0;
        const couponClaimLimit =
          expiryClaimLimit && "overAllLimit" in expiryClaimLimit
            ? expiryClaimLimit.overAllLimit
            : 0;

        const couponOverAllLimit = (await CouponClaim.findOne({
          couponId,
        }).select("overAllLimit")) ?? { overAllLimit: 0 };
        const userOverAllLimit = (await UserCouponClaim.findOne({
          userId,
          couponId,
        }).select("overAllLimit")) ?? { overAllLimit: 0 };

        if (userClaimLimit > 0) {
          if (userOverAllLimit?.overAllLimit >= userClaimLimit) {
            const expireAfterClaiming = await UserCouponGrabb.findOneAndUpdate(
              {
                userId,
                couponId,
              },
              { $set: { isDeleted: true } },
            );
            if (!expireAfterClaiming) {
              const createGrabb = await UserCouponGrabb.create({
                userId,
                couponId,
                date: Date.now(),
                isDeleted: true,
                businessId: couponz?.businessId,
                expiryDate: Date.now(),
              });
              if (!createGrabb) {
                return c.json(
                  {
                    err: true,
                    message: "Coupon not found",
                    data: razorpay_order_id,
                  },
                  200,
                );
              }
            }
          }
        }

        if (couponClaimLimit > 0) {
          if (couponOverAllLimit?.overAllLimit >= couponClaimLimit) {
            await Couponz.findOneAndUpdate(
              {
                _id: couponId,
              },
              { $set: { isActive: false, isDeleted: true } },
            );
          }
        }
      }

      const signature = createHmac("sha256", RAZORPAY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const registrationToken = await DeviceToken.find({
        businessId: businessId,
      });

      if (registrationToken.length > 0) {
        for (const obj of registrationToken) {
          if (obj.notification) {
            const pushMessage = {
              token: obj.token, // or use 'topic' if you're sending to a topic
              notification: {
                title: "Payment Successful !!",
                body: `T-${tableName?.slice(
                  -2,
                )} has successfully paid ${paidAmount}`,
              },
              android: {
                notification: {
                  channel_id: "custom_channel_id",
                  sound: "order",
                },
              },
            };

            admin
              .messaging()
              .send(pushMessage)
              .then((response: unknown) => {
                return c.json({
                  message: "FCM message sent successfully",
                  err: false,
                  data: response,
                });
              })
              .catch((err: Error) => {
                return c.json(
                  {
                    message: "Error sending FCM message",
                    err: true,
                    data: {},
                  },
                  400,
                );
              });
          }
        }
      }

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
      }

      const headersResult = RazorpayWebhookHeadersSchema.safeParse(
        c.req.header(),
      );
      if (!headersResult.success) {
        console.log("Invalid headers");

        return respond(c, "Invalid headers", true, 200, {});
      }

      const {
        "x-razorpay-signature": razorpaySignature,
        "x-razorpay-event-id": razorpayEventId,
      } = headersResult.data as RazorpayWebhookHeaders;

      const isSignatureValid = validateWebhookSignature(
        JSON.stringify(body),
        razorpaySignature,
        RAZORPAY_WEBHOOK_SECRET,
      );
      if (!isSignatureValid) {
        console.log("Invalid signature");
        return respond(c, "Invalid signature", true, 200, {});
      }

      const bodyResult = RazorpayWebhookBodySchema.safeParse(body);

      if (!bodyResult.success) {
        return respond(c, "Invalid body", true, 200, {});
      }

      //@ts-ignore
      const { event, payload } = bodyResult.data;

      const getOrder = await Order.findOne({
        order_id: payload.payment.entity.order_id,
      });
      const tableSession = await UserSession.findOne({
        businessId: getOrder?.businessId,
        tableName: getOrder?.tableName,
      });

      if (event === "payment.failed") {
        const claimCoins = Number(getOrder?.claimedCoins) || 0;
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
                businessId: getOrder?.businessId,
                alertType: "ONLINE",
                order_id: getOrder?._id,
                userId: getOrder?.userId,
                status: "FAIL",
                tableName: getOrder?.tableName,
                coinsApplied: tableSession?.claimedCoins || claimCoins > 0,
                isAccepted: false,
                date: Date.now(),
                message: `Fail ${getOrder?.total}`,
                couponId: payload?.payment?.entity.notes?.couponId,
                mode: payload?.payment?.entity?.method,
              },
            ],
            { session },
          );

          QrBill.findOneAndUpdate(
            { requestBillId: tableSession?.billRequestId },
            { status: "FAILED" },
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
            posDiscount = await calculateDiscount(
              getOrder?.businessId.toString() || "",
              Number(getOrder?.billValue),
              claimCoins,
            );
          }

          let getCashBack = 0;

          if (payload?.payment?.entity?.notes?.loyaltyId) {
            if (claimCoins > 0) {
              await removeCoins(
                claimCoins,
                getOrder.tableName,
                payload.payment.entity.notes.loyaltyId || "",
                getOrder?._id.toString() || "",
                getOrder?.userId.toString() || "",
                session,
              );
            }

            let cashBack = await calculatedCashbackCoins(
              getOrder?.businessId.toString(),
              getOrder?.billValue || 0,
              claimCoins,
            );

            if (getOrder?.cashbackAvailable === false) {
              cashBack = 0;
            }

            const cashBackCoins = await addCoins(
              cashBack,
              getOrder?.userId.toString() || "",
              getOrder?._id.toString() || "",

              getOrder?.tableName,
              getOrder?.businessId.toString() || "",
              payload.payment.entity.notes.loyaltyId || "",

              session,
            );

            getCashBack = cashBackCoins;
          }

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
                couponId: getOrder?.couponId,
                channelId: getOrder?.channelId,
                earnCoins: getCashBack,
                date: Date.now(),
                tax: tableSession?.finalTax,
                serviceCharge: tableSession?.serviceCharge,
                posBillRequestId: tableSession?.billRequestId,
                posBillId: tableSession?.billInvoiceId,
                settleType: tableSession?.settleType || "PAYMENT_GATEWAY",
                initialSubTotal: tableSession?.initialSubTotal,
                initialTax: tableSession?.initialTax,
                initialTotal: tableSession?.initialTotal,
                finalSubTotal: tableSession?.finalSubTotal,
                discount: tableSession?.discount,
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
                tableName: `T-${getOrder?.tableName?.slice(-2)}`,
                isAccepted: false,
                userId: getOrder?.userId,
                posDiscount: posDiscount,
                date: Date.now(),
                mode: payload.payment.entity.method,
              },
            ],
            { session },
          );
        }
      }

      return respond(c, "Webhook received successfully", false, 200, {});
    });
  })

  .post("/razorpay-webhook/2/:merchantId", async (c) => {
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
      }

      const headersResult = RazorpayWebhookHeadersSchema.safeParse(
        c.req.header(),
      );
      if (!headersResult.success) {
        return respond(c, "Invalid headers", true, 200, {});
      }

      const {
        "x-razorpay-signature": razorpaySignature,
        "x-razorpay-event-id": razorpayEventId,
      } = headersResult.data as RazorpayWebhookHeaders;

      const isSignatureValid = validateWebhookSignature(
        JSON.stringify(body),
        razorpaySignature,
        RAZORPAY_WEBHOOK_SECRET,
      );
      if (!isSignatureValid) {
        return respond(c, "Invalid signature", true, 200, {});
      }

      const bodyResult = RazorpayWebhookBodySchema.safeParse(body);

      if (!bodyResult.success) {
        return respond(c, "Invalid body", true, 200, {});
      }
      //@ts-ignore
      const { event, payload } = bodyResult.data;

      const getOrder = await Order.findOne({
        order_id: payload.payment.entity.order_id,
      });

      if (event === "payment.captured") {
        const paymentAlreadyExist = await Payment.findOne({
          razorpayEventId: razorpayEventId,
        });

        if (!paymentAlreadyExist && getOrder) {
          const claimCoins = Number(getOrder?.claimedCoins) || 0;

          if (payload.payment.entity.notes.loyaltyId) {
            const existingUser = (await UserReward.findOne({
              userId: getOrder.userId,
              loyaltyId: payload.payment.entity.notes.loyaltyId,
            }).select("rewards")) || { rewards: 0 };

            const existingLoyalty = await LoyaltySettings.findOne({
              businessId: getOrder.businessId,
              isActive: true,
            }).select("rewardLimit");

            const coinsCalculated = await calculateReward(
              existingUser.rewards,
              claimCoins,
              existingLoyalty?.rewardLimit as number,
              session,
            );

            const userGrabbed = await UserCouponGrabb.findOne({
              userId: getOrder.userId,
              businessId: getOrder.businessId,
              isDeleted: false,
            }).count();

            const userById = await User.findById(getOrder.userId);

            const userTags = await UserTags.find({
              userId: getOrder.userId,
              businessId: getOrder.businessId,
            });
            let tagIds = [];
            for (const tag of userTags) {
              tagIds.push(tag.tagId);
            }

            const userAnalytics = await UserAnalytic.findOne({
              userId: getOrder?.userId,
            }).select("totalSpend visitCount");
            if (userAnalytics) {
              const countAvgSpend =
                Math.round(
                  userAnalytics.totalSpend || 0 / userAnalytics.visitCount || 0,
                ) || 0;
              await UserAnalytic.findOneAndUpdate(
                { userId: getOrder?.userId },
                {
                  $inc: {
                    totalSpend: getOrder.total,
                    visitCount: 1,
                    coinzIssued: coinsCalculated.finalReward,
                    coinzUsed: claimCoins,
                  },
                  $set: {
                    avgSpend: countAvgSpend,
                    tableName: getOrder?.tableName,
                    couponCount: userGrabbed,
                    currentCoins: coinsCalculated.finalReward,
                    tagIds: tagIds,
                    dob: userById?.dob,
                  },
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
                    coinzIssued: coinsCalculated.finalReward,
                    coinzUsed: claimCoins,
                    tableName: getOrder?.tableName,
                    couponCount: userGrabbed,
                    currentCoins: coinsCalculated.finalReward,
                    tagIds: tagIds,
                    dob: userById?.dob,
                  },
                ],
                { session },
              );
            }
          }
        }
      }

      return respond(c, "2 Webhook received successfully", false, 200, {});
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

      const appInfo = await DeviceToken.findOne({
        token: { $exists: true },
        v: { $exists: true },
      });

      const tableInfo = await Table.findOne({ businessId, name: tableName });

      let hiCode = "";

      if (message === "Share the code of the table") {
        hiCode = tableInfo?.hiCode;
      }

      const alert = await PaymentAlert.create({
        businessId: businessId,
        alertType: "WAITER",
        userId: userId,
        status: "SUCCESS",
        tableName: tableName,
        message: message,
        date: Date.now(),
        order_id: new ObjectId(),
        hiCode: hiCode,
        v: appInfo?.v,
        appUrl: appInfo?.appUrl,
        updateFeature: appInfo?.updateFeature,
      });

      const registrationToken = await DeviceToken.find({
        businessId: businessId,
      });

      if (registrationToken.length > 0) {
        for (const obj of registrationToken) {
          if (obj.notification) {
            const pushMessage = {
              token: obj.token, // or use 'topic' if you're sending to a topic
              notification: {
                title: "Hi Captain !!",
                body: `T-${tableName?.slice(-2)} : ${message}`,
              },
              android: {
                notification: {
                  channel_id: "custom_channel_id",
                  sound: "order",
                },
              },
            };

            admin
              .messaging()
              .send(pushMessage)
              .then((response: unknown) => {
                return c.json({
                  message: "FCM message sent successfully",
                  err: false,
                  data: response,
                });
              })
              .catch((err: Error) => {
                return c.json(
                  {
                    message: "Error sending FCM message",
                    err: true,
                    data: {},
                  },
                  400,
                );
              });
          }
        }
      }

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
        alertType: {
          $in: ["ONLINE", "FORCE_SETTLE", "NORMAL_SETTLE", "OFFLINE"],
        },
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

      const appInfo = await DeviceToken.findOne({
        token: { $exists: true },
        v: { $exists: true },
      });

      PaymentAlert.updateMany(
        {
          businessId,
          alertType: ["WAITER"],
          isAccepted: false,
        },
        {
          v: appInfo?.v,
          appUrl: appInfo?.appUrl,
          updateFeature: appInfo?.updateFeature,
        },
        { new: true },
      );

      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        alertType: ["WAITER"],
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
        existingPaymentAlerts.length === 0
          ? [
            {
              v: appInfo?.v,
              appUrl: appInfo?.appUrl,
              updateFeature: appInfo?.updateFeature,
            },
          ]
          : existingPaymentAlerts,
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
      const {
        comment,
        waiterName,

        settleModes = [],
        split = false,
        duesUserId,
        npcUserId,
      } = requestData;
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
          isActive: true,
        }).select("loyaltyId");

        if (alert.alertType !== "OFFLINE") {
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
            const order = await Order.findById(alert.order_id).populate({
              path: "userId",
              select: "name",
            });

            const paymentMode = await UpiMode.findById(settleModes[0]._id);

            if (!paymentMode) {
              return c.json({
                message: "Payment mode not found",
                err: true,
                data: {},
              });
            }

            if (order) {
              let finalCashBack = 0;
              if (
                paymentMode?.name !== "complementary" &&
                paymentMode?.name !== "npc"
              ) {
                let cashBack = await calculatedCashbackCoins(
                  order.businessId.toString(),
                  Number(order.billValue),
                  Number(order.claimedCoins),
                );

                if (existingLoyalty?.loyaltyId && order.claimedCoins > 0) {
                  await removeCoins(
                    Number(order?.claimedCoins),
                    order.tableName,
                    existingLoyalty?.loyaltyId?.toString() || "",
                    order._id.toString(),
                    order.userId._id.toString(),
                    session,
                  );
                  if (order.cashbackAvailable === false) {
                    cashBack = 0;
                  }

                  finalCashBack = await addCoins(
                    cashBack,
                    order.userId._id.toString(),
                    order._id.toString(),
                    order.tableName || "",
                    order.businessId.toString(),

                    existingLoyalty?.loyaltyId.toString() || "",

                    session,
                  );
                }
              }

              const isHavePos = await BusinessPosConfig.findOne({
                businessId: order.businessId,
                isDeleted: false,
              });

              const tableSession = await UserSession.findOne({
                businessId: order.businessId,
                tableName: order.tableName,
              });

              const npcUser = await NpcUser.findById(npcUserId);

              let modifyTotal = 0;
              if (
                paymentMode?.name === "npc" ||
                paymentMode?.name === "dues" ||
                paymentMode?.name === "complementary"
              ) {
                modifyTotal = 0;
              } else {
                modifyTotal = order.total;

                if (settleModes.length > 1) {
                  for (const settle of settleModes) {
                    if (settle.name === "complementary") {
                      modifyTotal -= settle.amount ?? 0;
                    }
                  }
                }
              }

              const createPayment = await Payment.create(
                [
                  {
                    businessId: alert.businessId,
                    order_id: order?._id,
                    total:
                      paymentMode?.name === "npc" ||
                        paymentMode?.name === "complementary"
                        ? 0
                        : order?.total,
                    mode: settleModes.length > 1 ? "split" : paymentMode?.name,
                    status: "SUCCESS",
                    paymentMode:
                      settleModes.length > 1 ? "split" : paymentMode?.name,
                    userId:
                      paymentMode?.name === "npc"
                        ? npcUser?.userId
                        : order?.userId,
                    claimedCoins:
                      paymentMode?.name === "npc" ||
                        paymentMode?.name === "complementary"
                        ? 0
                        : order?.claimedCoins,
                    billValue: order?.billValue,
                    tips: order?.tips,
                    tableName: order?.tableName,
                    earnCoins:
                      paymentMode?.name === "npc" ||
                        paymentMode?.name === "complementary"
                        ? 0
                        : finalCashBack,
                    razorpayEventId: nanoid(15),
                    razorpayOrderId: nanoid(15),
                    razorpayPaymentId: nanoid(15),
                    couponId: order?.couponId,
                    channelId: order?.channelId,
                    posBillId: tableSession?.billInvoiceId,
                    tax:
                      paymentMode?.name === "npc" ||
                        paymentMode?.name === "complementary"
                        ? 0
                        : tableSession?.finalTax,
                    serviceCgarge:
                      paymentMode?.name === "npc" ||
                        paymentMode?.name === "complementary"
                        ? 0
                        : tableSession?.serviceCharge,
                    posBillRequestId: tableSession?.billRequestId,
                    splitModes: settleModes,
                    waiterName,
                    date: Date.now(),
                    initialSubTotal: tableSession?.initialSubTotal,
                    initialTax: tableSession?.initialTax,
                    initialTotal: tableSession?.initialTotal,
                    finalSubTotal: tableSession?.finalSubTotal,
                  },
                ],
                { session },
              );

              if (duesUserId && paymentMode?.name === "dues") {
                await PendingDues.create(
                  [
                    {
                      billId: createPayment[0]._id,
                      businessId: order.businessId,
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
                      totalDuesAmount: order.total,
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
                      totalNpcAmount: order.total,
                    },
                  },
                  { session },
                );
              }

              if (isHavePos) {
                const res = await axios.post(posApiPaths.settleTable, {
                  app_key: isHavePos.accessKey,
                  app_secret: isHavePos?.secretKey,
                  access_token: isHavePos.authToken,
                  restID: isHavePos?.restId,
                  bill_request_id: tableSession?.billRequestId,
                  amount_paid: modifyTotal,
                  pin: tableSession?.pin,
                });

                if (res.data.success === "0") {
                  throw new Error("payment failed in pos");
                }

                await KotOrder.updateMany(
                  {
                    tableName: order.tableName,
                    businessId: order.businessId,
                  },
                  {
                    $set: {
                      settled: true,
                    },
                  },
                  {
                    session,
                  },
                );

                await Table.findOneAndUpdate(
                  {
                    businessId: order.businessId,
                    name: order.tableName,
                  },
                  {
                    $set: {
                      status: "EMPTY",
                      currentTableAmount: 0,
                      userIds: [],
                      totalItemCount: 0,
                      capacity: 0,
                      hiCode: "",
                      isTransfer: false,
                    },
                  },
                  {
                    session,
                  },
                );
                await QrBill.findOneAndUpdate(
                  {
                    requestBillId: tableSession?.billRequestId,
                  },
                  {
                    $set: {
                      status: "SUCCESS",
                    },
                  },
                  {
                    session,
                  },
                );
                await UserSession.deleteOne(
                  {
                    tableName: order.tableName,
                    businessId: order.businessId,
                  },
                  {
                    session,
                  },
                );
              }
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
    ubacMiddleware("sale_summary"),
    zValidator("query", paramsSchema),
    async (c) => {
      const { businessId, from, to } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const payments = await Payment.find({
        businessId,
        isDeleted: false,
        date: { $gte: fromDate, $lte: toDate },
      });

      const totalOrders = payments.length;

      let overAllAmount = 0;
      let totalOnlineSale = 0;
      const offlineSales: Record<string, number> = {};

      const activeTable = await Table.find({
        businessId: businessId,
        status: "ACTIVE",
      });
      const totalActiveTableValue = activeTable.reduce((acc, table) => {
        return acc + (table?.currentTableAmount ?? 0);
      }, 0);

      for (const payment of payments) {
        const { total = 0, paymentMode, mode, splitModes } = payment;

        if (mode === "split" && Array.isArray(splitModes)) {
          let splitTotal = 0;

          for (const settle of splitModes) {
            if (settle.name !== "complementary") {
              splitTotal += settle.amount ?? 0;
              offlineSales[settle.name] =
                (offlineSales[settle.name] || 0) + (settle.amount ?? 0);
            }
          }

          overAllAmount += splitTotal; // Only add non-complementary split values
        } else if (!["dues", "npc", "complementary"].includes(mode)) {
          overAllAmount += total; // Add total if it's not dues, npc, or complementary
        }

        if (paymentMode === "online") {
          totalOnlineSale += total;
        } else if (!["dues", "npc", "complementary"].includes(paymentMode)) {
          offlineSales[mode] = (offlineSales[mode] || 0) + total;
        }
      }

      delete offlineSales["complementary"];
      delete offlineSales["split"];

      return c.json({
        err: false,
        data: {
          overAllAmount, // Excludes complementary but includes cash in split modes
          onlineSale: { online: totalOnlineSale },
          offlineSale: offlineSales,
          totalOrders,
          totalActiveTableValue,
        },
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
      let { appliedFilter } = c.req.query();
      const { businessId, from, to } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;

      const filterConditions = [
        { businessId },
        { date: { $gte: fromDate, $lte: toDate } },
      ];

      if (typeof appliedFilter === "string") {
        try {
          appliedFilter = JSON.parse(appliedFilter);
        } catch (err) {
          console.error("Failed to parse appliedFilter", err);
          appliedFilter = [];
        }
      }

      if (
        appliedFilter &&
        Array.isArray(appliedFilter) &&
        appliedFilter.length > 0
      ) {
        const modeFilter = appliedFilter.find((f) => f.key === "mode");

        if (modeFilter && Array.isArray(modeFilter.value)) {
          const modeValues = modeFilter.value.map((v) => v.toLowerCase());
          const includesOnline = modeValues.includes("online");
          const offlineModes = modeValues.filter((value) => value !== "online");

          const combinedModes = [
            ...(includesOnline ? ["online"] : []),
            ...offlineModes,
          ];

          if (combinedModes.length > 0) {
            filterConditions.push({ paymentMode: { $in: combinedModes } });
          }
        }

        const typeFilter = appliedFilter.find((f) => f.key === "type");
        if (typeFilter && Array.isArray(typeFilter.value)) {
          const typeMapping = {
            Coinz: "COINZ",
            Couponz: "COUPONZ",
            "No Rewardz": "NO_REWARDZ",
            Disscount: "DISCOUNT",
          };
          const types = typeFilter.value.map((v) => typeMapping[v] || v);
          filterConditions.push({ discountType: { $in: types } });
        }

        const warningsFilter = appliedFilter.find((f) => f.key === "warnings");
        if (
          warningsFilter &&
          Array.isArray(warningsFilter.value) &&
          !warningsFilter.value.includes("All")
        ) {
          const warningsMapping = {
            "Force Settle": "FORCE_SETTLE",
            "Free Tables": "FREE_SETTLE",
          };
          const warnings = warningsFilter.value.map(
            (v) => warningsMapping[v] || v,
          );
          filterConditions.push({ settleType: { $in: warnings } });
        }
      }

      const queryObject = { $and: filterConditions, isDeleted: false };

      const existingPayments = await Payment.find(queryObject)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate({ path: "order_id" })
        .populate({ path: "userId", select: "name phone" });

      let totalSale = 0;

      for (const payment of existingPayments) {
        const { total = 0, mode, splitModes } = payment;

        if (mode === "split" && Array.isArray(splitModes)) {
          let splitTotal = 0;

          for (const settle of splitModes) {
            if (settle.name !== "complementary") {
              splitTotal += settle.amount ?? 0;
            }
          }

          totalSale += splitTotal; // Only adding valid split mode amounts
        } else if (!["dues", "npc", "complementary"].includes(mode)) {
          totalSale += total; // Add total if it's not dues, npc, or complementary
        }
      }

      return c.json({
        err: false,
        data: {
          totalSale, // Excludes complementary but includes valid split amounts
          existingPayments,
        },
        message: "existing payment",
      });
    },
  )

  .get(
    "/:id/bills_csv",
    // authTokenValidator,
    // requireAuthorization([
    //   ClientRoles.OWNER,
    //   ClientRoles.HIPAL_CUSTOMER,
    //   ClientRoles.CAPTAIN,
    // ]),
    zValidator("query", paramsSchema),
    async (c) => {
      let { appliedFilter } = c.req.query();
      const { businessId, from, to } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const filterConditions = [
        { businessId },
        { date: { $gte: fromDate, $lte: toDate } },
      ];

      if (typeof appliedFilter === "string") {
        try {
          appliedFilter = JSON.parse(appliedFilter);
        } catch (err) {
          console.error("Failed to parse appliedFilter", err);
          appliedFilter = [];
        }
      }

      if (
        appliedFilter &&
        Array.isArray(appliedFilter) &&
        appliedFilter.length > 0
      ) {
        const modeFilter = appliedFilter.find((f) => f.key === "mode");
        if (modeFilter && Array.isArray(modeFilter.value)) {
          const modeValues = modeFilter.value.map((v) => v.toLowerCase());
          const includesOnline = modeValues.includes("online");
          const offlineModes = modeValues.filter((value) => value !== "online");

          const combinedModes = [
            ...(includesOnline ? ["online"] : []),
            ...offlineModes,
          ];

          if (combinedModes.length > 0) {
            filterConditions.push({ paymentMode: { $in: combinedModes } });
          }
        }

        const typeFilter = appliedFilter.find((f) => f.key === "type");
        if (typeFilter && Array.isArray(typeFilter.value)) {
          const typeMapping = {
            Coinz: "COINZ",
            Couponz: "COUPONZ",
            "No Rewardz": "NO_REWARDZ",
            Disscount: "DISCOUNT",
          };
          const types = typeFilter.value.map((v) => typeMapping[v] || v);
          filterConditions.push({ discountType: { $in: types } });
        }

        const warningsFilter = appliedFilter.find((f) => f.key === "warnings");
        if (
          warningsFilter &&
          Array.isArray(warningsFilter.value) &&
          !warningsFilter.value.includes("All")
        ) {
          const warningsMapping = {
            "Force Settle": "FORCE_SETTLE",
            "Free Tables": "FREE_SETTLE",
          };
          const warnings = warningsFilter.value.map(
            (v) => warningsMapping[v] || v,
          );
          filterConditions.push({ settleType: { $in: warnings } });
        }
      }

      const queryObject = { $and: filterConditions, isDeleted: false };


      const existingPayments = await Payment.find(queryObject)
        .sort({ _id: -1 })
        .populate({ path: "order_id" })
        .populate({ path: "userId", select: "name phone" });

      // initialize all totals
      let totalBillValue = 0;
      let totalInitialSubTotal = 0;
      let totalInitialTax = 0;
      let totalInitialTotal = 0;
      let totalFinalSubTotal = 0;
      let totalTax = 0;
      let totalServiceCharge = 0;
      let totalAmount = 0;
      let totalTips = 0;
      let totalClaimedCoins = 0;
      let totalEarnCoins = 0;
      let totalDiscount = 0;

      const rows = existingPayments.map((payment: any) => {
        const {
          _id,
          date,
          userId,
          tableName,
          mode,
          paymentMode,
          billValue = 0,
          tips = 0,
          claimedCoins = 0,
          earnCoins = 0,
          discount = 0,
          discountType,
          initialSubTotal = 0,
          initialTax = 0,
          initialTotal = 0,
          finalSubTotal = 0,
          tax = 0,
          serviceCharge = 0,
          total: finalTotal = 0,
          order_id,
          waiterName,
          posBillId,
          posBillRequestId,
          settleType,
          comment,
          splitModes = [],
        } = payment;

        // aggregate totals
        totalBillValue += billValue;
        totalInitialSubTotal += initialSubTotal;
        totalInitialTax += initialTax;
        totalInitialTotal += initialTotal;
        totalFinalSubTotal += finalSubTotal;
        totalTax += tax;
        totalServiceCharge += serviceCharge;
        totalAmount += finalTotal;
        totalTips += tips;
        totalClaimedCoins += claimedCoins;
        totalEarnCoins += earnCoins;
        totalDiscount += discount;

        // flatten splitModes
        const splitInfo = Array.isArray(splitModes)
          ? splitModes.map((m: any) => `${m.name}=${m.amount}`).join("; ")
          : "";

        return {
          PAYMENT_ID: _id.toString(),
          DATE: new Date(date).toLocaleString(),
          USER_NAME: userId?.name ?? "",
          USER_PHONE: userId?.phone ?? "",
          TABLE_NAME: tableName || "",
          MODE: mode,
          PAYMENT_MODE: paymentMode,
          BILL_VALUE: billValue,
          INITIAL_SUBTOTAL: initialSubTotal,
          INITIAL_TAX: initialTax,
          INITIAL_TOTAL: initialTotal,
          FINAL_SUBTOTAL: finalSubTotal === 0 ? initialSubTotal : finalSubTotal,
          TAX: tax,
          SERVICE_CHARGE: serviceCharge,
          TOTAL: finalTotal,
          TIPS: tips,
          CLAIMED_COINS: claimedCoins,
          EARNED_COINS: earnCoins,
          DISCOUNT: discount,
          DISCOUNT_TYPE: discountType,
          MODES: splitInfo,
          SETTLE_TYPE: settleType,
          COMMENT: comment,
          WAITER_NAME: waiterName,
          POS_BILL_ID: posBillId,
          POS_BILL_REQUEST_ID: posBillRequestId,
          ORDER_ID: order_id?._id.toString() ?? "",
        };
      });

      // push totals row
      rows.push({
        PAYMENT_ID: "TOTALS (DO NOT EDIT THIS ROW)",
        DATE: "",
        USER_NAME: "",
        USER_PHONE: "",
        TABLE_NAME: "",
        MODE: "",
        PAYMENT_MODE: "",
        BILL_VALUE: `="${totalBillValue.toFixed(2)}"`,
        INITIAL_SUBTOTAL: `="${totalInitialSubTotal.toFixed(2)}"`,
        INITIAL_TAX: `="${totalInitialTax.toFixed(2)}"`,
        INITIAL_TOTAL: `="${totalInitialTotal.toFixed(2)}"`,
        FINAL_SUBTOTAL: `="${totalFinalSubTotal.toFixed(2)}"`,
        TAX: `="${totalTax.toFixed(2)}"`,
        SERVICE_CHARGE: `="${totalServiceCharge.toFixed(2)}"`,
        TOTAL: `="${totalAmount.toFixed(2)}"`,
        TIPS: `="${totalTips.toFixed(2)}"`,
        CLAIMED_COINS: `="${totalClaimedCoins.toFixed(2)}"`,
        EARNED_COINS: `="${totalEarnCoins.toFixed(2)}"`,
        DISCOUNT: `="${totalDiscount.toFixed(2)}"`,
        DISCOUNT_TYPE: "",
        MODES: "",
        SETTLE_TYPE: "",
        COMMENT: "",
        WAITER_NAME: "",
        POS_BILL_ID: "",
        POS_BILL_REQUEST_ID: "",
        ORDER_ID: "",
      });

      const csvString = Papa.unparse(rows, {
        header: true,
        quotes: true,
        skipEmptyLines: true,
      });

      const formatDate = (timestamp: number) => {
        const d = new Date(timestamp);
        // Example: "2023-03-19"
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0",
        )}-${String(d.getDate()).padStart(2, "0")}`;
      };

      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);
      const fileName = `payments_${fromStr}_to_${toStr}.csv`;

      // Set response headers
      c.header("Content-Type", "text/csv");
      c.header("Content-Disposition", `attachment; filename="${fileName}"`);

      // Return the CSV directly
      return c.body(csvString);
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

        dateOfJoining: z.string().optional(),
        avgSpend: z.string().optional(),
        visitCount: z.string().optional(),
        pageNumber: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const existingUserAnalytics = await UserAnalytic.find({
        businessId,
      }).populate("userId");

      return c.json(
        {
          data: existingUserAnalytics,
          message: "existing payment",
          err: false,
        },
        200,
      );
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
      const { businessId, userId } = c.req.query();

      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;
      const userTotalSale = await UserAnalytic.findOne({ userId })
        .select("totalSpend visitCount avgSpend coinzIssued coinzUsed")
        .populate({
          path: "userId",
          select: "name phone",
        });

      const userReward = await UserReward.findOne({
        userId,
        loyaltyId: businessId,
      }).select("rewards");

      const existingPayments = await Payment.find({
        userId,
        businessId,
        isDeleted: false,
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
          currentCoinz: userReward.rewards || 0,
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
      const { loyaltyId, userId } = c.req.query();

      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;

      const existingRewardHistory = await UserRewardHistory.find({
        userId,
        loyaltyId,
      })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate({
          path: "order_id",
          select: "billValue",
        });

      return c.json({
        err: false,
        data: existingRewardHistory,
        message: "existing payment",
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
        userId: z
          .string({
            message: "userId is required",
          })
          .optional(),
        businessId: z.string({
          message: "businessId is required",
        }),
        removeTagIds: z.array(z.string()).optional(),
      }),
    ),

    async (c) => {
      const { paymentId } = c.req.param();
      const requestData = await c.req.json();
      const {
        tagIds = [],
        comment,
        userId,
        businessId,
        removeTagIds = [],
      } = requestData;

      if (removeTagIds.length > 0) {
        await Payment.findByIdAndUpdate(
          {
            _id: paymentId,
          },
          {
            $pull: {
              tagIds: { $in: removeTagIds },
            },
          },
        );

        // await UserTags.deleteMany({
        //   userId,
        //   tagId: { $in: removeTagIds },
        // });
      }

      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        { $addToSet: { tagIds: { $each: tagIds } }, comment },
        { new: true },
      );

      // const user = await User.findById(userId).select("name phone");

      // const date = Date.now();
      // const customDate = new Date(date).setHours(0, 0, 0, 0);

      // for (let i = 0; i < tagIds.length; i++) {
      //   const tagId = tagIds[i];
      //   const tag = await TagModel.findById(tagIds[i]).select("duration time");

      //   const createUserTag = await UserTags.create({
      //     userId,
      //     tagId,
      //     businessId,
      //     date: Date.now(),
      //     reminderDate: customDate + tag.duration + tag.time,
      //   });
      //   const reminderDateObj = new Date(createUserTag.reminderDate);
      //   const cronExpression = `${reminderDateObj.getMinutes()} ${reminderDateObj.getHours()} ${reminderDateObj.getDate()} ${
      //     reminderDateObj.getMonth() + 1
      //   } *`;

      //   schedule(cronExpression, async () => {
      //     const options = {
      //       method: "POST",
      //       url: "https://control.msg91.com/api/v5/flow/",
      //       headers: {
      //         accept: "application/json",
      //         "content-type": "application/json",
      //         authkey: "387796AmyGlDBq63b2d75aP1",
      //       },
      //       data: {
      //         template_id: "66b1f189d6fc055e463e3b63",
      //         sender: "HiPalc",
      //         mobiles: `91${user.phone}`,
      //         var: `${user.name}`,
      //       },
      //     };
      //     await axios(options);
      //   });
      // }

      // if (!payment) {
      //   return c.json({
      //     err: true,
      //     data: {},
      //     message: "Payment not found",
      //   });
      // }

      return c.json({
        err: false,
        data: {},
        message: "Payment tag updated successfully",
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
      const users = await UserAnalytic.find({
        userId: { $in: userIds },
      }).populate({
        path: "userId",
        select: "name phone",
      });
      return c.json({
        data: users,
        err: false,
        message: "User found",
      });
    },
  )

  .post("/razorpay-webhook/3/:merchantId", async (c) => {
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
      }

      const headersResult = RazorpayWebhookHeadersSchema.safeParse(
        c.req.header(),
      );
      if (!headersResult.success) {
        return respond(c, "Invalid headers", true, 200, {});
      }

      const {
        "x-razorpay-signature": razorpaySignature,
        "x-razorpay-event-id": razorpayEventId,
      } = headersResult.data as RazorpayWebhookHeaders;

      const isSignatureValid = validateWebhookSignature(
        JSON.stringify(body),
        razorpaySignature,
        RAZORPAY_WEBHOOK_SECRET,
      );
      if (!isSignatureValid) {
        return respond(c, "Invalid signature", true, 200, {});
      }

      const bodyResult = RazorpayWebhookBodySchema.safeParse(body);

      if (!bodyResult.success) {
        return respond(c, "Invalid body", true, 200, {});
      }
      //@ts-ignore
      const { event, payload } = bodyResult.data;

      const getOrder = await Order.findOne({
        order_id: payload.payment.entity.order_id,
      }).populate({
        path: "userId",
        select: "name",
      });

      if (event === "payment.captured") {
        if (getOrder) {
          const tableSession = await UserSession.findOne({
            tableName: getOrder.tableName,
            businessId: getOrder.businessId,
          });
          const alreadyTableSettle = await TempTableSettle.findOne({
            businessId: getOrder.businessId,
            tableName: getOrder.tableName,
            hiCode: tableSession?.hiCode,
            pin: tableSession?.pin,
          });

          if (!alreadyTableSettle) {
            const table = await Table.findOne({
              businessId: getOrder.businessId,
              name: getOrder.tableName,
            });

            const pos = await BusinessPosConfig.findOne({
              businessId: getOrder.businessId,
              isDeleted: false,
            });

            if (pos) {
              const res = await axios.post(posApiPaths.settleTable, {
                app_key: pos.accessKey,
                app_secret: pos.secretKey,
                access_token: pos.authToken,
                restID: pos.restId,
                bill_request_id: tableSession?.billRequestId,
                amount_paid: getOrder.total,
                pin: tableSession?.pin,
              });

              await TempTableSettle.create(
                [
                  {
                    businessId: getOrder.businessId,
                    tableName: getOrder.tableName,
                    settleBy: getOrder.userId?.name,
                    hiCode: tableSession?.hiCode,
                    pin: tableSession?.pin,
                  },
                ],
                {
                  session,
                },
              );
              await QrBill.findOneAndUpdate(
                {
                  requestBillId: tableSession?.billRequestId,
                },
                {
                  $set: {
                    status: "SUCCESS",
                  },
                },
                {
                  session,
                },
              );

              await UserSession.deleteOne(
                {
                  tableName: getOrder.tableName,
                  businessId: getOrder.businessId,
                },
                {
                  session,
                },
              );

              await KotOrder.updateMany(
                {
                  tableName: getOrder.tableName,
                  businessId: getOrder.businessId,
                },
                {
                  $set: {
                    settled: true,
                  },
                },
                {
                  session,
                },
              );

              await Table.findOneAndUpdate(
                {
                  businessId: getOrder.businessId,
                  name: getOrder.tableName,
                },
                {
                  $set: {
                    status: "EMPTY",
                    currentTableAmount: 0,
                    userIds: [],
                    totalItemCount: 0,
                    capacity: 0,
                    hiCode: "",
                    isTransfer: false,
                  },
                },
                {
                  session,
                },
              );
            }
          }
        }

        return respond(c, "3 Webhookk received successfully", false, 200, {});
      }

      return respond(c, "3 Webhook received successfully", false, 200, {});
    });
  })

  .get(
    "/sale/exception_and_rewards",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const payments = await Payment.find({
        businessId,
        isDeleted: false,
        date: { $gte: fromDate, $lte: toDate },
      });

      let totalDiscount = 0;
      let totalDuesGiven = 0;
      let totalNpc = 0;
      let totalComplementary = 0;
      let totalCoinsGiven = 0;
      let totalCoinsUsed = 0;
      let totalCouponUsed = 0;
      let totalCouponzCount = 0;
      let totalCoinsUsedCount = 0;

      for (const payment of payments) {
        totalDiscount += payment.discount ?? 0;

        if (payment.mode === "dues") {
          totalDuesGiven += payment.total;
        }

        if (payment.mode === "npc") {
          totalNpc += payment.billValue;
        }

        if (payment.mode === "complementary") {
          totalComplementary += payment.billValue;
        }

        if (
          Array.isArray(payment.splitModes) &&
          payment.splitModes.length > 1
        ) {
          for (const split of payment.splitModes) {
            if (split.name === "complementary") {
              totalComplementary += split.amount ?? 0;
            }
          }
        }

        totalCoinsGiven += payment.earnCoins ?? 0;

        if (payment.claimedCoins && !payment.couponId) {
          totalCoinsUsed += payment.claimedCoins ?? 0;
          totalCoinsUsedCount += 1;
        }

        if (payment.couponId) {
          totalCouponUsed += payment.claimedCoins ?? 0;
          totalCouponzCount += 1;
        }
      }

      return c.json({
        err: false,
        data: {
          exceptionSale: {
            totalDuesGiven,
            totalNpc,
            totalComplementary,
            totalDiscount,
          },
          rewardSale: {
            totalCoinsGiven,
            totalCoinsUsed,
            totalCoinsUsedCount,
            totalCouponzCount,
            totalCouponUsed,
          },
        },
      });
    },
  )

  .get(
    "/sale/other_and_warnings",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const payments = await Payment.find({
        businessId,
        isDeleted: false,
        date: { $gte: fromDate, $lte: toDate },
      });

      let totalTax = 0;
      let totalTip = 0;
      let totalServiceCharge = 0;
      let totalForceSettle = 0;
      let totalFreeSettle = 0;

      for (const payment of payments) {
        if (payment.mode !== "dues") {
          totalTax += payment.tax ?? 0;
        }
        totalTip += payment.tips ?? 0;
        totalServiceCharge += payment.serviceCharge ?? 0;

        if (payment.settleType === "FORCE_SETTLE") {
          totalForceSettle += payment.total;
        } else if (payment.settleType === "FREE_SETTLE") {
          totalFreeSettle += payment.total;
        }
      }

      return c.json({
        err: false,
        data: {
          otherSale: {
            totalTax: Math.round(totalTax),
            totalTip,
            totalServiceCharge: Math.round(totalServiceCharge),
          },
          warningSale: {
            totalForceSettle,
            totalFreeSettle,
          },
        },
      });
    },
  )

  .put(
    "/update_payment",

    zValidator("json", z.object({ paymentId: z.string(), mode: z.string() })),

    async (c) => {
      const { paymentId, mode } = await c.req.json();

      const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        {
          $set: {
            mode,
            paymentMode: mode,
          },
        },
        { new: true },
      );

      if (!updatedPayment) {
        return c.json({
          err: true,
          data: {},
          message: "Payment not found",
        });
      }

      return c.json({
        err: false,
        data: { _id: updatedPayment._id },
        message: "Payment updated successfully",
      });
    },
  );

export default paymentsRouter;
