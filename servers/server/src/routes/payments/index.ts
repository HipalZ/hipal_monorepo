import {
  BusinessPosConfig,
  BusinessSettings,
  DeviceToken,
  DuesUser,
  GroupAnalytic,
  KotOrder,
  LoyaltySettings,
  MergeTable,
  NpcUser,
  Order,
  OutLetInfo,
  Payment,
  PaymentAlert,
  PendingDues,
  QrBill,
  RazorpayWebhookQueueModel,
  Reviews,
  SplitBillTableSession,
  Subscriber,
  Table,
  UnsettleTable,
  UpiMode,
  User,
  UserAnalytic,
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
import { endOfDay, startOfDay } from "date-fns";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import { createHmac } from "node:crypto";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import {
  generateBillInvoice,
  generateSplitBillInvoice,
} from "../../services/bill";
// import { enqueueRazorpayJob } from "../../queues/enqueue";
import { checkOriginBillIsSplit } from "../../services/splitBill";
import { type KotOrderTypes, calculateBillTotals } from "../../utils/bill";
import { getMerchantConfig } from "../../utils/cacheHelper";
import {
  adjustFromToTimestamps,
  getISTDateRange,
  isTodayIST,
} from "../../utils/defaultBillingTime";
import { executePosHandler } from "../../utils/executePoshandlers.ts";
import { convertToPetpoojaCart } from "../../utils/helper";
import { monadHelperFunction, triggerBlockchain } from "../../utils/monad";
import { posApiPaths } from "../../utils/posConfig/petPooja";
// import { queueClient } from "../../utils/queue/queueClient";
import {
  type MerchantConfig,
  razorpayWrapper,
} from "../../utils/razorpay-wrapper";
import { buildUnifiedDashboardCore } from "../../utils/reportHelper/unifiedSalesDashBoard";
import { respond } from "../../utils/response";
import { buildBillsExcelBuffer } from "../../utils/sales";
import { generateTenDigitCode, sendPushNotification } from "../pos/index.js";
const admin = require("firebase-admin");
// Hash a passwordss

const { validateWebhookSignature } = require("../../utils/razorpay-utils");

// Parses a query param to a finite number, or undefined. Guards the
// user-analytics filter against "NaN"/garbage values that previously
// poisoned the dateOfJoining query and crashed the clients tab.
const toFiniteNumber = (value?: string): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const SIX_MONTH_EXPORT_WINDOW_MS = 183 * 24 * 60 * 60 * 1000;

function validateUserAnalyticsCsvDateWindow(
  params: Record<string, string | undefined>,
) {
  const dateFrom = toFiniteNumber(params.dateFrom);
  const dateTo = toFiniteNumber(params.dateTo);

  if (dateFrom === undefined || dateTo === undefined) {
    return {
      valid: false,
      message:
        "Please select a date range before downloading customers. Download up to 6 months of data at a time.",
    };
  }

  if (dateFrom > dateTo) {
    return {
      valid: false,
      message: "From date should be before To date.",
    };
  }

  if (dateTo - dateFrom > SIX_MONTH_EXPORT_WINDOW_MS) {
    return {
      valid: false,
      message:
        "This download range is too large. Please download customers in 6-month batches.",
    };
  }

  return { valid: true, message: "" };
}

// Shared by /users/Analytics/filter and /users/Analytics/download_csv.
// Rules: a date range applies only when valid dates are sent; numeric
// filters (visits/spend) work standalone over the full customer base;
// with no filters at all, defaults to today's joiners (legacy behavior).
async function buildUserAnalyticsFilterQuery(
  params: Record<string, string | undefined>,
): Promise<Record<string, any>> {
  const query: Record<string, any> = { businessId: params.businessId };

  const fromDate = toFiniteNumber(params.dateFrom);
  const toDate = toFiniteNumber(params.dateTo);
  const spendMin = toFiniteNumber(params.spendMin);
  const spendMax = toFiniteNumber(params.spendMax);
  const totalSpendMin = toFiniteNumber(params.totalSpendMin);
  const totalSpendMax = toFiniteNumber(params.totalSpendMax);
  const visitsMin = toFiniteNumber(params.visitsMin);
  const visitsMax = toFiniteNumber(params.visitsMax);
  const search = params.search?.trim() ?? "";

  if (fromDate !== undefined || toDate !== undefined) {
    query.dateOfJoining = {
      $gte: fromDate ?? 0,
      $lte: toDate ?? Date.now(),
    };
  }

  if (spendMin !== undefined || spendMax !== undefined) {
    query.avgSpend = {};
    if (spendMin !== undefined) query.avgSpend.$gte = spendMin;
    if (spendMax !== undefined) query.avgSpend.$lte = spendMax;
  }

  if (totalSpendMin !== undefined || totalSpendMax !== undefined) {
    query.totalSpend = {};
    if (totalSpendMin !== undefined) query.totalSpend.$gte = totalSpendMin;
    if (totalSpendMax !== undefined) query.totalSpend.$lte = totalSpendMax;
  }

  if (visitsMin !== undefined || visitsMax !== undefined) {
    query.visitCount = {};
    if (visitsMin !== undefined) query.visitCount.$gte = visitsMin;
    if (visitsMax !== undefined) query.visitCount.$lte = visitsMax;
  }

  if (search !== "") {
    const isPhone = /^[0-9]{10}$/.test(search);
    if (isPhone) {
      const user = await User.findOne({ phone: search }).select("_id");
      query.userId = user?._id || null;
    } else {
      const matchedUsers = await User.find({
        name: new RegExp(search, "i"),
      })
        .select("_id")
        .limit(2000)
        .lean();
      query.userId = { $in: matchedUsers.map((u) => u._id) };
    }
  }

  // No filters at all → legacy behavior: today's joiners only
  const hasAnyFilter =
    fromDate !== undefined ||
    toDate !== undefined ||
    spendMin !== undefined ||
    spendMax !== undefined ||
    totalSpendMin !== undefined ||
    totalSpendMax !== undefined ||
    visitsMin !== undefined ||
    visitsMax !== undefined ||
    search !== "";
  if (!hasAnyFilter) {
    query.dateOfJoining = {
      $gte: startOfDay(new Date()).getTime(),
      $lte: endOfDay(new Date()).getTime(),
    };
  }

  return query;
}

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
        userCount: item.userCount || 0,
        userPercentage: item.userPercentage || 0,
        groupColor: item.groupId.groupColor || "",
        groupName: item.groupId.name || "",
      };
    });
};
//dates
export const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

export const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

export const calculateDiscount = async (
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

  const discount = Math.abs(
    finalBillValue / (1 + gstPercentage + serviceChargePercentage) -
      estimatedSubTotal,
  ).toFixed(2);

  return discount;
};

export const calculatePayReward = (
  exist: number,
  reward: number,
  limit: number,
) => {
  // 1. RAW Arithmetic only
  const total = (exist || 0) + (reward || 0);
  const cappedBalance = Math.min(total, limit || 0);

  // Return the RAW decimal difference
  const rawFinalReward = Math.abs(cappedBalance - (exist || 0));

  // DO NOT Math.round here
  return {
    finalReward: rawFinalReward,
    curentBalance: cappedBalance,
  };
};

export const addRewardHistory = async (
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
export const removeRewardHistory = async (
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

export const removeCoins = async (
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
      { $inc: { rewards: -claimedCoins } },
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

export const addCoins = async (
  coins: number,
  userId: string,
  order_id: string,
  tableName: string,
  businessId: string,
  loyaltyId: string,
  session: ClientSession,
) => {
  const existingUser = await UserReward.findOne({ userId, loyaltyId });
  const existingLoyalty = await LoyaltySettings.findOne({
    businessId,
    isActive: true,
  });

  if (existingUser && existingLoyalty) {
    // 1. Get the RAW decimal from the helper
    const coinsCalculated = calculatePayReward(
      existingUser.rewards || 0,
      coins,
      existingLoyalty.rewardLimit as number,
    );

    await UserReward.findOneAndUpdate(
      { userId, loyaltyId },
      { $inc: { rewards: coinsCalculated.finalReward } },
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

    return coinsCalculated.finalReward;
  }
  return 0;
};

export const calculatedCashbackCoins = async (
  businessId: string,
  billValue: number,
  claimedCoins: number,
  couponDiscount: number,
  discount: number,
) => {
  const LoyaltySetting = await LoyaltySettings.findOne({
    businessId,
    isActive: true,
  }).select("rewardLimit setCashBackPercentage");

  if (!LoyaltySetting) return 0;

  // 1. Calculate the subtotal (The amount actually paid)
  // Adding (|| 0) protects against undefined values causing NaN
  const subTotal =
    (billValue || 0) -
    (claimedCoins || 0) -
    (couponDiscount || 0) -
    (discount || 0);

  // 2. Arithmetic first: Calculate reward with raw decimals
  const rawCoins = (LoyaltySetting.setCashBackPercentage / 100) * subTotal;

  return rawCoins < 0 ? 0 : rawCoins;
};

const totalSubscribers = async (businessId: string) => {
  const subscribers = await Subscriber.find({
    isDeleted: false,
    businessId,
  }).countDocuments();

  return subscribers;
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

        variantId,
      } = requestData;

      const tInfo = await Table.findOne({ businessId, name: tableName });

      if (!tInfo) {
        return respond(c, "Table not found", true, 404, {});
      }

      const isTableMerge = await MergeTable.findOne({
        businessId: businessId,
        childTableIds: tInfo._id.toString(),
      }).populate("parentTableId");
      const tab = await UserSession.findOne({
        businessId,
        tableName: isTableMerge?.parentTableId?.name || tableName,
      });
      const businessPosConfig = await BusinessPosConfig.findOne({
        businessId,
        isDeleted: false,
        active: true,
      });

      if (businessPosConfig && businessPosConfig.posName === "PETPOOJA") {
        await generateBillInvoice(tab?.tableName, businessId, true);
      }

      const tableSession = await UserSession.findOne({
        businessId,
        tableName: isTableMerge?.parentTableId?.name || tableName,
      });

      const merchant = await BusinessSettings.findOne({
        businessId,
      })
        .select("razorpayMerchantId razorpayKeyId businessId")
        .lean();

      if (!merchant) {
        return respond(c, "Merchant not found", true, 404, {});
      }

      if (businessPosConfig) {
        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const kotItems = (await KotOrder.find({
          tableName: isTableMerge?.parentTableId?.name || tableName,
          settled: false,
          accepted: true,
          businessId,
        }).lean()) as KotOrderTypes[];

        const { totalDishTotal } = calculateBillTotals(kotItems);

        if (totalDishTotal !== tableSession.subTotal) {
          return respond(
            c,
            "totalDishTotal is not equal to subTotal",
            true,
            400,
            {},
          );
        }

        if (businessPosConfig.posName === "HIPAL_Z") {
          const result = await executePosHandler(
            businessPosConfig.posName,
            "online_order",
            {
              businessId: tableSession.businessId,
              variantId: variantId,
              total: total,
              billValue: billValue,
              tips: tips,
              claimedCoins: claimedCoins,
              couponId: couponId,
              channelId: channelId,
              cashbackAvailable,
              currency: currency,
              userId: userId,
              tableName: isTableMerge?.parentTableId?.name || tableName,
              merchantId: merchant.razorpayMerchantId,
            },
          );
          if (!result) {
            throw new Error("Error in POS handler");
          }
          if (result) {
            return respond(c, "success", false, 200, result);
          }
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

          await generateSplitBillInvoice(variantId, businessId, true);

          if (tableSession.variantsCounts > 1) {
            const splitBillTableSession =
              await SplitBillTableSession.findById(variantId);

            if (!splitBillTableSession) {
              return respond(c, "Split bill session not found", true, 404, {});
            }

            //@ts-ignore
            return runInTransaction(async (session: ClientSession) => {
              const merchantId = merchant.razorpayMerchantId as string;
              const uniqueOrderId = nanoid(15);

              const client = await razorpayWrapper.getClient(merchantId);
              const response = await client.orders.create({
                amount: splitBillTableSession.total
                  ? splitBillTableSession.total * 100
                  : total * 100, // Fixed multiplication logic
                currency: currency,
                receipt: uniqueOrderId,
              });
              const saveOrder = await Order.create(
                [
                  {
                    total: splitBillTableSession?.total || total,
                    currency,
                    billValue: splitBillTableSession?.subTotal || billValue,
                    businessId,
                    receipt: uniqueOrderId,
                    userId,
                    claimedCoins:
                      splitBillTableSession?.claimedCoins || claimedCoins,
                    tableName: isTableMerge?.parentTableId?.name || tableName,
                    order_id: response.id,
                    tips: splitBillTableSession?.tips || tips,
                    couponId,
                    channelId,
                    cashbackAvailable,
                    date: Date.now(),
                    billId: splitBillTableSession?._id.toString(),
                    discount: splitBillTableSession?.discount,
                    couponDiscount: splitBillTableSession?.couponDiscount,
                    gst: splitBillTableSession?.gst,
                    variantId,
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
          }

          if (tableSession.variantsCounts === 1) {
            const kotOrders = (await KotOrder.find({
              tableName: isTableMerge?.parentTableId?.name || tableName,
              settled: false,
              accepted: true,
              businessId,
              isSync: false,
            }).lean()) as KotOrderTypes[];

            const cartItems = kotOrders.flatMap((order) =>
              order.cart.filter((item) => !item.isDeleted && !item.isOpenItem),
            );

            const unsettleTable = await UnsettleTable.find({
              businessId,
              restId: businessPosConfig.restId,
              sync: false,
            });

            for (const table of unsettleTable) {
              const payload = {
                app_key: businessPosConfig.accessKey,
                app_secret: businessPosConfig.secretKey,
                access_token: businessPosConfig.authToken,
                restID: businessPosConfig.restId,
                pin: table?.pin,
                tableNo: table?.tableName,
              };

              const response = await axios.post(
                posApiPaths.requestBill,
                payload,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                },
              );

              if (
                response.data.success === "1" &&
                response.data?.bill_request_id?.length > 2
              ) {
                const updateSettleTable = await UnsettleTable.findOneAndUpdate(
                  { _id: table._id },
                  {
                    $set: {
                      sync: true,
                    },
                  },
                  { new: true },
                );
                const res = await axios.post(posApiPaths.settleTable, {
                  app_key: businessPosConfig.accessKey,
                  app_secret: businessPosConfig.secretKey,
                  access_token: businessPosConfig.authToken,
                  restID: businessPosConfig.restId,
                  bill_request_id: response.data.bill_request_id,
                  amount_paid: table?.total,
                  pin: table?.pin,
                });
              }
            }

            const newPin = generateTenDigitCode();
            const registerUser = await axios.post(posApiPaths.registerUser, {
              app_key: businessPosConfig.accessKey,
              app_secret: businessPosConfig.secretKey,
              access_token: businessPosConfig.authToken,
              restID: businessPosConfig.restId,
              phone: newPin,
            });

            await UserSession.findOneAndUpdate(
              {
                tableName: isTableMerge?.parentTableId?.name || tableName,
                businessId: businessId,
              },
              {
                $set: {
                  pin: newPin,
                },
              },
              { new: true },
            );

            if (cartItems.length > 0) {
              const petpoojaCart = convertToPetpoojaCart(
                cartItems,
                businessPosConfig.restId,
                tableSession?.customerName,
                tableSession?.pin,
                tableName,
                businessPosConfig.accessKey,
                businessPosConfig.secretKey,
                businessPosConfig.authToken,
              );

              await KotOrder.updateMany(
                {
                  tableName: isTableMerge?.parentTableId?.name || tableName,
                  settled: false,
                  accepted: true,
                  businessId,
                },
                {
                  $set: {
                    isSync: true,
                  },
                },
              );

              await UserSession.findOneAndUpdate(
                {
                  tableName: isTableMerge?.parentTableId?.name || tableName,
                  businessId,
                },
                {
                  $set: {
                    isUserRegistered: true,
                    billRequest: true,
                  },
                },
              );

              const saveKot = await axios.post(
                posApiPaths.saveKot,
                petpoojaCart,
              );

              if (saveKot.data.success === "0") {
                return respond(c, "KOT not saved", true, 400, {});
              }
            }
          }

          if (tableSession.variantsCounts === 1) {
            const splitBillTableSession =
              await SplitBillTableSession.findById(variantId);

            if (!splitBillTableSession) {
              return respond(c, "Split bill session not found", true, 404, {});
            }

            //@ts-ignore
            return runInTransaction(async (session: ClientSession) => {
              const merchantId = merchant.razorpayMerchantId as string;
              const uniqueOrderId = nanoid(15);

              const client = await razorpayWrapper.getClient(merchantId);
              const response = await client.orders.create({
                amount: splitBillTableSession.total
                  ? splitBillTableSession.total * 100
                  : total * 100, // Fixed multiplication logic
                currency: currency,
                receipt: uniqueOrderId,
              });
              const saveOrder = await Order.create(
                [
                  {
                    total: splitBillTableSession?.total || total,
                    currency,
                    billValue: splitBillTableSession?.subTotal || billValue,
                    businessId,
                    receipt: uniqueOrderId,
                    userId,
                    claimedCoins:
                      splitBillTableSession?.claimedCoins || claimedCoins,
                    tableName: isTableMerge?.parentTableId?.name || tableName,
                    order_id: response.id,
                    tips: splitBillTableSession?.tips || tips,
                    couponId,
                    channelId,
                    cashbackAvailable,
                    date: Date.now(),
                    billId: splitBillTableSession?._id.toString(),
                    discount: splitBillTableSession?.discount,
                    couponDiscount: splitBillTableSession?.couponDiscount,
                    gst: splitBillTableSession?.gst,
                    variantId,
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
          }
        }

        const kotOrders = (await KotOrder.find({
          tableName: isTableMerge?.parentTableId?.name || tableName,
          settled: false,
          accepted: true,
          businessId,
          isSync: false,
        }).lean()) as KotOrderTypes[];

        const cartItems = kotOrders.flatMap((order) =>
          order.cart.filter((item) => !item.isDeleted && !item.isOpenItem),
        );

        const unsettleTable = await UnsettleTable.find({
          businessId,
          restId: businessPosConfig.restId,
          sync: false,
        });

        for (const table of unsettleTable) {
          const payload = {
            app_key: businessPosConfig.accessKey,
            app_secret: businessPosConfig.secretKey,
            access_token: businessPosConfig.authToken,
            restID: businessPosConfig.restId,
            pin: table?.pin,
            tableNo: table?.tableName,
          };

          const response = await axios.post(posApiPaths.requestBill, payload, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (
            response.data.success === "1" &&
            response.data?.bill_request_id?.length > 2
          ) {
            const updateSettleTable = await UnsettleTable.findOneAndUpdate(
              { _id: table._id },
              {
                $set: {
                  sync: true,
                },
              },
              { new: true },
            );
            const res = await axios.post(posApiPaths.settleTable, {
              app_key: businessPosConfig.accessKey,
              app_secret: businessPosConfig.secretKey,
              access_token: businessPosConfig.authToken,
              restID: businessPosConfig.restId,
              bill_request_id: response.data.bill_request_id,
              amount_paid: table?.total,
              pin: table?.pin,
            });
          }
        }

        const newPin = generateTenDigitCode();
        const registerUser = await axios.post(posApiPaths.registerUser, {
          app_key: businessPosConfig.accessKey,
          app_secret: businessPosConfig.secretKey,
          access_token: businessPosConfig.authToken,
          restID: businessPosConfig.restId,
          phone: newPin,
        });

        await UserSession.findOneAndUpdate(
          {
            tableName: isTableMerge?.parentTableId?.name || tableName,
            businessId: businessId,
          },
          {
            $set: {
              pin: newPin,
            },
          },
          { new: true },
        );

        if (cartItems.length > 0) {
          const petpoojaCart = convertToPetpoojaCart(
            cartItems,
            businessPosConfig.restId,
            tableSession?.customerName,
            tableSession?.pin,
            isTableMerge?.parentTableId?.name || tableName,
            businessPosConfig.accessKey,
            businessPosConfig.secretKey,
            businessPosConfig.authToken,
          );

          await KotOrder.updateMany(
            {
              tableName: isTableMerge?.parentTableId?.name || tableName,
              settled: false,
              accepted: true,
              businessId,
            },
            {
              $set: {
                isSync: true,
              },
            },
          );

          await UserSession.findOneAndUpdate(
            {
              tableName: isTableMerge?.parentTableId?.name || tableName,
              businessId,
            },
            {
              $set: {
                isUserRegistered: true,
                billRequest: true,
              },
            },
          );

          const saveKot = await axios.post(posApiPaths.saveKot, petpoojaCart);

          if (saveKot.data.success === "0") {
            return respond(c, "KOT not saved", true, 400, {});
          }
        }
      }

      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const merchantId = merchant.razorpayMerchantId as string;
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
              total: tableSession?.total || total,
              currency,
              billValue: tableSession?.subTotal || billValue,
              businessId,
              receipt: uniqueOrderId,
              userId,
              claimedCoins: tableSession?.claimedCoins || claimedCoins,
              tableName: isTableMerge?.parentTableId?.name || tableName,
              order_id: response.id,
              tips: tableSession?.tips || tips,
              couponId,
              channelId,
              cashbackAvailable,
              date: Date.now(),
              billId: tableSession?._id.toString(),
              discount: tableSession?.discount,
              couponDiscount: tableSession?.couponDiscount,
              gst: tableSession?.gst,
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

  // ── Razorpay Payment Link (hosted page — works in WhatsApp WebView) ──
  .post(
    "/createPaymentLink/:merchantId",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),
    zValidator("param", z.object({ merchantId: z.string() })),
    zValidator(
      "json",
      z.object({
        businessId: z.string(),
        total: z.number(),
        currency: z.string().default("INR"),
        userId: z.string().optional(),
        tableName: z.string().optional(),
        callbackUrl: z.string(),
        customerName: z.string().optional(),
        customerPhone: z.string().optional(),
        customerEmail: z.string().optional(),
        description: z.string().optional(),
      }),
    ),

    async (c) => {
      const { merchantId } = c.req.param();
      const requestData = await c.req.json();
      const {
        businessId,
        total,
        currency,
        userId,
        tableName,
        callbackUrl,
        customerName,
        customerPhone,
        customerEmail,
        description,
      } = requestData;

      if (!total || total <= 0) {
        return respond(c, "Invalid amount", true, 400, {});
      }

      const merchant = await BusinessSettings.findOne({ businessId })
        .select("razorpayMerchantId razorpayKeyId businessId")
        .lean();

      if (!merchant) {
        return respond(c, "Merchant not found", true, 404, {});
      }

      try {
        const client = await razorpayWrapper.getClient(merchantId);
        const uniqueReceiptId = nanoid(15);

        // Format phone: Razorpay requires E.164 format (+91XXXXXXXXXX)
        let formattedPhone = "";
        console.log("customerPhone", customerPhone);
        if (customerPhone) {
          const digits = customerPhone.replace(/\D/g, "");
          formattedPhone =
            digits.length === 10
              ? `+91${digits}`
              : digits.length === 12 && digits.startsWith("91")
                ? `+${digits}`
                : `+91${digits.slice(-10)}`;
        }

        const paymentLink = await client.paymentLink.create({
          amount: Math.round(total * 100),
          currency,
          description: description || `Payment - ${businessId}`,
          reference_id: uniqueReceiptId,
          customer: {
            name: customerName || "Customer",
            contact: formattedPhone || "+910000000000",
            email: customerEmail || undefined,
          },
          notify: { sms: false, email: false },
          callback_url: callbackUrl,
          callback_method: "get",
          options: {
            checkout: {
              prefill: {
                contact: formattedPhone || "",
                ...(customerEmail && { email: customerEmail }),
              },
            },
          },
          notes: {
            businessId,
            tableName: tableName || "",
            userId: userId || "",
            total: String(total),
            receipt: uniqueReceiptId,
          },
        });
        console.log("paymentLink", paymentLink);
        // Save order record (same pattern as createOrder)
        await Order.create({
          total,
          currency,
          billValue: total,
          businessId,
          receipt: uniqueReceiptId,
          userId,
          claimedCoins: 0,
          tableName: tableName || "",
          order_id: paymentLink.id,
          tips: 0,
          cashbackAvailable: false,
          date: Date.now(),
        });

        return respond(c, "Payment link created", false, 200, {
          payment_link_id: paymentLink.id,
          short_url: paymentLink.short_url,
          receipt: uniqueReceiptId,
        });
      } catch (error: any) {
        const razorpayError =
          error?.error?.description || error?.description || "";
        const msg = razorpayError || error?.message || "Unknown error";
        console.error("[PaymentLink] Error:", msg, error?.error || error);
        return respond(c, msg, true, 400, {});
      }
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
        variantId,
      } = requestData;
      const tInfo = await Table.findOne({ businessId, name: tableName });

      if (!tInfo) {
        return respond(c, "Table not found", true, 404, {});
      }

      const isTableMerge = await MergeTable.findOne({
        businessId: businessId,
        childTableIds: tInfo._id.toString(),
      }).populate("parentTableId");

      const tab = await UserSession.findOne({
        businessId,
        tableName: isTableMerge?.parentTableId?.name || tableName,
      });

      const businessPosConfig = await BusinessPosConfig.findOne({
        businessId,
        isDeleted: false,
        active: true,
      });

      if (businessPosConfig && businessPosConfig.posName === "PETPOOJA") {
        await generateBillInvoice(tab?.tableName, businessId, true);
      }

      const tableSession = await UserSession.findOne({
        tableName: isTableMerge?.parentTableId?.name || tableName,
        businessId,
      });

      const orderAlreadyExist = await PaymentAlert.findOne({
        businessId,
        tableName: isTableMerge?.parentTableId?.name || tableName,
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

      if (businessPosConfig) {
        if (!tableSession) {
          return respond(c, "Table session not found", true, 404, {});
        }

        const kotItems = (await KotOrder.find({
          tableName: isTableMerge?.parentTableId?.name || tableName,
          settled: false,
          accepted: true,
          businessId,
        }).lean()) as KotOrderTypes[];

        const { totalDishTotal } = calculateBillTotals(kotItems);

        console.log("totalDishTotal", totalDishTotal);

        if (totalDishTotal !== tableSession.subTotal) {
          return respond(
            c,
            "totalDishTotal is not equal to subTotal",
            true,
            400,
            {},
          );
        }
        if (businessPosConfig.posName === "HIPAL_Z") {
          const result = await executePosHandler(
            businessPosConfig.posName,
            "offline_order",
            {
              businessId: tableSession.businessId,
              variantId: variantId,
              total: total,
              billValue: billValue,
              tips: tips,
              claimedCoins: claimedCoins,
              couponId: couponId,
              channelId: channelId,
              cashbackAvailable,
              currency: currency,
              userId: userId,
              tableName: isTableMerge?.parentTableId?.name || tableName,
            },
          );

          if (!result) {
            throw new Error("Error in POS handler");
          }
          if (result) {
            return respond(c, "success", false, 200, result);
          }
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

          await generateSplitBillInvoice(variantId, businessId, true);

          if (tableSession.variantsCounts > 1) {
            const splitBillTableSessionData =
              await SplitBillTableSession.findById(variantId);
            if (!splitBillTableSessionData) {
              return respond(c, "Split bill session not found", true, 404, {});
            }
            //@ts-ignore
            return runInTransaction(async (session: ClientSession) => {
              const uniqueOrderId = nanoid(15);

              const saveOrder = await Order.create(
                [
                  {
                    total: splitBillTableSessionData?.total || total,
                    currency,
                    receipt: uniqueOrderId,
                    userId,
                    claimedCoins:
                      splitBillTableSessionData?.claimedCoins || claimedCoins,
                    tableName: isTableMerge?.parentTableId?.name || tableName,
                    tips: splitBillTableSessionData?.tips || tips,
                    billValue: splitBillTableSessionData?.subTotal || billValue,
                    businessId,
                    order_id: uniqueOrderId,
                    couponId,
                    channelId,
                    cashbackAvailable,
                    date: Date.now(),
                    billId: splitBillTableSessionData?._id.toString(),
                    discount: splitBillTableSessionData?.discount,
                    couponDiscount: splitBillTableSessionData?.couponDiscount,
                    gst: splitBillTableSessionData?.gst,
                    variantId,
                  },
                ],
                { session },
              );
              if (!saveOrder)
                return respond(c, "Order not created", true, 400, {});

              await PaymentAlert.create(
                [
                  {
                    businessId: businessId,
                    userId: userId,
                    alertType: "OFFLINE",
                    order_id: saveOrder?.[0]._id,
                    status: "SUCCESS",
                    tableName: isTableMerge?.parentTableId?.name || tableName,
                    coinsApplied: !!(
                      splitBillTableSessionData?.claimedCoins &&
                      splitBillTableSessionData.claimedCoins > 0
                    ),
                    message: `Paid ${total}`,
                    date: Date.now(),
                    billId: splitBillTableSessionData?._id.toString(),
                    mode: "OFFLINE",
                  },
                ],
                { session },
              );

              return respond(c, "Order created successfully", false, 200, {
                order_id: saveOrder?.[0]._id,
              });
            });
          }

          if (tableSession.variantsCounts === 1) {
            const kotOrders = (await KotOrder.find({
              tableName: isTableMerge?.parentTableId?.name || tableName,
              settled: false,
              accepted: true,
              businessId,
              isSync: false,
            }).lean()) as KotOrderTypes[];

            const cartItems = kotOrders.flatMap((order) =>
              order.cart.filter((item) => !item.isDeleted && !item.isOpenItem),
            );

            const unsettleTable = await UnsettleTable.find({
              businessId,
              restId: businessPosConfig.restId,
              sync: false,
            });

            for (const table of unsettleTable) {
              const payload = {
                app_key: businessPosConfig.accessKey,
                app_secret: businessPosConfig.secretKey,
                access_token: businessPosConfig.authToken,
                restID: businessPosConfig.restId,
                pin: table?.pin,
                tableNo: table?.tableName,
              };

              const response = await axios.post(
                posApiPaths.requestBill,
                payload,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                },
              );

              if (
                response.data.success === "1" &&
                response.data?.bill_request_id?.length > 2
              ) {
                const updateSettleTable = await UnsettleTable.findOneAndUpdate(
                  { _id: table._id },
                  {
                    $set: {
                      sync: true,
                    },
                  },
                  { new: true },
                );
                const res = await axios.post(posApiPaths.settleTable, {
                  app_key: businessPosConfig.accessKey,
                  app_secret: businessPosConfig.secretKey,
                  access_token: businessPosConfig.authToken,
                  restID: businessPosConfig.restId,
                  bill_request_id: response.data.bill_request_id,
                  amount_paid: table?.total,
                  pin: table?.pin,
                });
              }
            }

            const newPin = generateTenDigitCode();
            const registerUser = await axios.post(posApiPaths.registerUser, {
              app_key: businessPosConfig.accessKey,
              app_secret: businessPosConfig.secretKey,
              access_token: businessPosConfig.authToken,
              restID: businessPosConfig.restId,
              phone: newPin,
            });

            await UserSession.findOneAndUpdate(
              {
                tableName: isTableMerge?.parentTableId?.name || tableName,
                businessId: businessId,
              },
              {
                $set: {
                  pin: newPin,
                },
              },
              { new: true },
            );

            if (kotOrders.length > 0) {
              const petpoojaCart = convertToPetpoojaCart(
                cartItems,
                businessPosConfig.restId,
                kotOrders[0].name,
                tableSession?.pin,
                isTableMerge?.parentTableId?.name || tableName,
                businessPosConfig.accessKey,
                businessPosConfig.secretKey,

                businessPosConfig.authToken,
              );

              await KotOrder.updateMany(
                {
                  tableName: isTableMerge?.parentTableId?.name || tableName,
                  settled: false,
                  accepted: true,
                  businessId,
                },
                {
                  $set: {
                    isSync: true,
                  },
                },
              );

              await UserSession.findOneAndUpdate(
                {
                  tableName: isTableMerge?.parentTableId?.name || tableName,
                  businessId,
                },
                {
                  $set: {
                    isUserRegistered: true,
                    billRequest: true,
                  },
                },
              );

              const saveKot = await axios.post(
                posApiPaths.saveKot,
                petpoojaCart,
              );

              if (saveKot.data.success === "0") {
                return respond(c, "Error in saving kot", true, 400, {});
              }
            }
          }
          if (tableSession.variantsCounts === 1) {
            const splitBillTableSessionData =
              await SplitBillTableSession.findById(variantId);

            if (!splitBillTableSessionData) {
              return respond(c, "Split bill session not found", true, 404, {});
            }

            //@ts-ignore
            return runInTransaction(async (session: ClientSession) => {
              const uniqueOrderId = nanoid(15);

              const saveOrder = await Order.create(
                [
                  {
                    total: splitBillTableSessionData?.total || total,
                    currency,
                    receipt: uniqueOrderId,
                    userId,
                    claimedCoins:
                      splitBillTableSessionData?.claimedCoins || claimedCoins,
                    tableName: isTableMerge?.parentTableId?.name || tableName,
                    tips: splitBillTableSessionData?.tips || tips,
                    billValue: splitBillTableSessionData?.subTotal || billValue,
                    businessId,
                    order_id: uniqueOrderId,
                    couponId,
                    channelId,
                    cashbackAvailable,
                    date: Date.now(),
                    billId: splitBillTableSessionData?._id.toString(),
                    discount: splitBillTableSessionData?.discount,
                    couponDiscount: splitBillTableSessionData?.couponDiscount,
                    gst: splitBillTableSessionData?.gst,
                    variantId,
                  },
                ],
                { session },
              );
              if (!saveOrder)
                return respond(c, "Order not created", true, 400, {});

              await PaymentAlert.create(
                [
                  {
                    businessId: businessId,
                    userId: userId,
                    alertType: "OFFLINE",
                    order_id: saveOrder?.[0]._id,
                    status: "SUCCESS",
                    tableName: isTableMerge?.parentTableId?.name || tableName,
                    coinsApplied: !!(
                      splitBillTableSessionData?.claimedCoins &&
                      splitBillTableSessionData.claimedCoins > 0
                    ),
                    message: `Paid ${total}`,
                    date: Date.now(),
                    billId: splitBillTableSessionData?._id.toString(),
                    mode: "OFFLINE",
                  },
                ],
                { session },
              );

              return respond(c, "Order created successfully", false, 200, {
                order_id: saveOrder?.[0]._id,
              });
            });
          }
        }

        const kotOrders = (await KotOrder.find({
          tableName: isTableMerge?.parentTableId?.name || tableName,
          settled: false,
          accepted: true,
          businessId,
          isSync: false,
        }).lean()) as KotOrderTypes[];

        const cartItems = kotOrders.flatMap((order) =>
          order.cart.filter((item) => !item.isDeleted && !item.isOpenItem),
        );

        const unsettleTable = await UnsettleTable.find({
          businessId,
          restId: businessPosConfig.restId,
          sync: false,
        });

        for (const table of unsettleTable) {
          const payload = {
            app_key: businessPosConfig.accessKey,
            app_secret: businessPosConfig.secretKey,
            access_token: businessPosConfig.authToken,
            restID: businessPosConfig.restId,
            pin: table?.pin,
            tableNo: table?.tableName,
          };

          const response = await axios.post(posApiPaths.requestBill, payload, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (
            response.data.success === "1" &&
            response.data?.bill_request_id?.length > 2
          ) {
            const updateSettleTable = await UnsettleTable.findOneAndUpdate(
              { _id: table._id },
              {
                $set: {
                  sync: true,
                },
              },
              { new: true },
            );
            const res = await axios.post(posApiPaths.settleTable, {
              app_key: businessPosConfig.accessKey,
              app_secret: businessPosConfig.secretKey,
              access_token: businessPosConfig.authToken,
              restID: businessPosConfig.restId,
              bill_request_id: response.data.bill_request_id,
              amount_paid: table?.total,
              pin: table?.pin,
            });
          }
        }

        const newPin = generateTenDigitCode();
        const registerUser = await axios.post(posApiPaths.registerUser, {
          app_key: businessPosConfig.accessKey,
          app_secret: businessPosConfig.secretKey,
          access_token: businessPosConfig.authToken,
          restID: businessPosConfig.restId,
          phone: newPin,
        });

        await UserSession.findOneAndUpdate(
          {
            tableName: isTableMerge?.parentTableId?.name || tableName,
            businessId: businessId,
          },
          {
            $set: {
              pin: newPin,
            },
          },
          { new: true },
        );

        if (kotOrders.length > 0) {
          const petpoojaCart = convertToPetpoojaCart(
            cartItems,
            businessPosConfig.restId,
            kotOrders[0].name,
            tableSession?.pin,
            isTableMerge?.parentTableId?.name || tableName,
            businessPosConfig.accessKey,
            businessPosConfig.secretKey,

            businessPosConfig.authToken,
          );

          await KotOrder.updateMany(
            {
              tableName: isTableMerge?.parentTableId?.name || tableName,
              settled: false,
              accepted: true,
              businessId,
            },
            {
              $set: {
                isSync: true,
              },
            },
          );

          await UserSession.findOneAndUpdate(
            {
              tableName: isTableMerge?.parentTableId?.name || tableName,
              businessId,
            },
            {
              $set: {
                isUserRegistered: true,
                billRequest: true,
              },
            },
          );

          const saveKot = await axios.post(posApiPaths.saveKot, petpoojaCart);

          if (saveKot.data.success === "0") {
            return respond(c, "Error in saving kot", true, 400, {});
          }
        }
      }

      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const uniqueOrderId = nanoid(15);

        const saveOrder = await Order.create(
          [
            {
              total: tableSession?.total || total,
              currency,
              receipt: uniqueOrderId,
              userId,
              claimedCoins: tableSession?.claimedCoins || claimedCoins,
              tableName: isTableMerge?.parentTableId?.name || tableName,
              tips: tableSession?.tips || tips,
              billValue: tableSession?.subTotal || billValue,
              businessId,
              order_id: uniqueOrderId,
              couponId,
              channelId,
              cashbackAvailable,
              date: Date.now(),
              billId: tableSession?._id.toString(),
              discount: tableSession?.discount,
              couponDiscount: tableSession?.couponDiscount,
              gst: tableSession?.gst,
            },
          ],
          { session },
        );
        if (!saveOrder) return respond(c, "Order not created", true, 400, {});

        await PaymentAlert.create(
          [
            {
              businessId: businessId,
              userId: userId,
              alertType: "OFFLINE",
              order_id: saveOrder?.[0]._id,
              status: "SUCCESS",
              tableName: isTableMerge?.parentTableId?.name || tableName,
              coinsApplied: !!(
                tableSession?.claimedCoins && tableSession.claimedCoins > 0
              ),
              message: `Paid ${total}`,
              date: Date.now(),
              billId: tableSession?._id.toString(),
              mode: "OFFLINE",
            },
          ],
          { session },
        );
        const registrationToken = await DeviceToken.find({
          businessId: businessId,
        });

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
        businessId: z.string(),
        netCoinz: z.string(),
      }),
    ),

    async (c) => {
      const requestData = await c.req.json();
      const { response } = requestData;
      const { merchantId } = c.req.param();
      const { userId, couponId, businessId, tableName, paidAmount, netCoinz } =
        c.req.query();
      const existingLoyalty = await LoyaltySettings.findOne({
        businessId: businessId,
        isActive: true,
      }).select("loyaltyId");
      const merchant = await BusinessSettings.findOne({
        razorpayMerchantId: merchantId,
      }).select("razorpayKeySecret");

      if (!merchant) {
        return respond(c, "Merchant not found", true, 404, {});
      }

      const RAZORPAY_SECRET = merchant?.razorpayKeySecret as string;

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

      if (signature === razorpay_signature && existingLoyalty?.loyaltyId) {
        // TODO monad integration
        await triggerBlockchain(
          businessId,
          existingLoyalty?.loyaltyId,
          userId,
          Number.parseFloat(netCoinz),
          razorpay_order_id,
        );
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

    const { merchantId } = c.req.param();
    const rawBody = await c.req.text();
    const headers = c.req.header();

    const signature = headers["x-razorpay-signature"];
    const razorpayEventId = headers["x-razorpay-event-id"];
    if (!signature || !razorpayEventId) {
      console.log("❌ Missing signature/event-id");
      return c.json({ status: "ignored" });
    }

    const merchantConfig =
      (await getMerchantConfig(merchantId)) ||
      (await BusinessSettings.findOne({
        razorpayMerchantId: merchantId,
      }).select("razorpayWebhookSecret"));

    if (!merchantConfig) {
      console.log("❌ No webhook secret found");
      return c.json({ status: "ignored" });
    }

    const secret = merchantConfig.razorpayWebhookSecret;

    const isValid = validateWebhookSignature(rawBody, signature, secret);
    if (!isValid) {
      console.log("❌ Invalid webhook signature");
      return c.json({ status: "ignored" });
    }

    const body = JSON.parse(rawBody);

    const {
      id,
      order_id,
      method,
      acquirer_data,
      error_description,
      error_reason,
    } = body.payload.payment.entity;

    if (!id || !order_id || !method) {
      console.log("❌ Missing id/order_id method");
      return c.json({ status: "ignored" });
    }

    const orderAlreadyExist = await RazorpayWebhookQueueModel.findOne({
      razorpayEventId: razorpayEventId,
    });

    if (!orderAlreadyExist) {
      const saveQueueModel = await RazorpayWebhookQueueModel.create({
        status: "PENDING",
        merchantId: merchantId,
        razorpayEventId: razorpayEventId,
        order_id: order_id,
        id: id,
        event: body.event,
        date: Date.now(),
        mode: method,
        acquirer_data: acquirer_data,
        error_description: error_description,
        error_reason: error_reason,
      });

      if (!saveQueueModel) {
        console.log("📌 Webhook could not be queued");
        return respond(c, "Webhook could not be queued", false, 200, {});
      }

      // enqueueRazorpayJob("razorpayPaymentHandler", {
      //   date: Date.now(),
      //   merchantId: merchantId,
      //   razorpayEventId: razorpayEventId,
      //   order_id: order_id,
      //   id: id,
      //   event: body.event,
      //   status: "PENDING",
      //   acquirer_data: acquirer_data,
      //   error_description: error_description,
      //   error_reason: error_reason,
      //   mode: method,
      // });
    }

    return respond(c, "Webhook received successfully", false, 200, {});
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
        console.log("razorpay_webhook_secret missing");
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
        console.log("Invalid body", bodyResult);

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

            const coinsCalculated = await calculatePayReward(
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
              businessId: getOrder?.businessId,
            }).select("totalSpend visitCount");
            if (userAnalytics) {
              const countAvgSpend = Math.round(
                userAnalytics.totalSpend / userAnalytics.visitCount,
              );
              await UserAnalytic.findOneAndUpdate(
                { userId: getOrder?.userId, businessId: getOrder?.businessId },
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
            sendPushNotification(obj.token, "customer", tableName);
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
          $in: ["ONLINE", "NORMAL_SETTLE", "OFFLINE"],
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

    // ubacMiddleware("offline_settle"),

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
      console.log("requestData", requestData);
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
          console.log("triggered order 1");
          return c.json({
            message: "Order accepted successfully",
            err: false,
            data: updateAlert,
          });
        }

        if (alert.alertType === "OFFLINE") {
          if (alert && !alert.isAccepted) {
            const order = await Order.findById(alert.order_id);

            const paymentMode = await UpiMode.findById(settleModes[0]._id);

            if (!paymentMode) {
              return c.json({
                message: "Payment mode not found",
                err: true,
                data: {},
              });
            }

            if (order) {
              let roundedClaimedCoins = Math.round(
                Number(order.claimedCoins) || 0,
              );
              const isHavePos = await BusinessPosConfig.findOne({
                businessId: order.businessId,
                isDeleted: false,
                active: true,
              });

              const tableSession = await UserSession.findOne({
                businessId: order.businessId,
                tableName: order.tableName,
              });

              if (isHavePos) {
                if (!tableSession) {
                  return respond(c, "Table session not found", true, 404, {});
                }
                if (isHavePos.posName === "HIPAL_Z") {
                  const result = await executePosHandler(
                    isHavePos.posName,
                    "offline_order_accept",
                    {
                      businessId: order.businessId,
                      alertId: alertId,
                      comment,
                      waiterName,
                      settleModes,
                      duesUserId,
                      npcUserId,
                    },
                  );

                  if (!result) {
                    throw new Error("Failed to process POS offline order");
                  }
                  console.log("triggered order 2");
                  if (result) {
                    return respond(
                      c,
                      "Order accepted successfully",
                      false,
                      200,
                      result,
                    );
                  }
                }

                const originBillIsSplit =
                  await checkOriginBillIsSplit(tableSession);
                if (originBillIsSplit) {
                  if (!order?.variantId) {
                    return respond(
                      c,
                      "variantId is required for split bill",
                      true,
                      400,
                      {},
                    );
                  }

                  const splitBillTableSessionData =
                    await SplitBillTableSession.findById(order.variantId);
                  if (!splitBillTableSessionData) {
                    return respond(
                      c,
                      "Split bill table session not found",
                      true,
                      404,
                      {},
                    );
                  }
                  if (tableSession.variantsCounts > 1) {
                    const npcUser = await NpcUser.findById(npcUserId);
                    let finalCashBack = 0;
                    if (
                      paymentMode?.name !== "complementary" &&
                      paymentMode?.name !== "npc"
                    ) {
                      let cashBack = await calculatedCashbackCoins(
                        order.businessId.toString(),
                        Number(order.billValue),
                        roundedClaimedCoins,
                        Number(order.couponDiscount),
                        Number(order.discount),
                      );
                      console.log("cashBack order 3", cashBack);
                      if (
                        existingLoyalty?.loyaltyId &&
                        roundedClaimedCoins > 0 &&
                        order.userId.toString()
                      ) {
                        await removeCoins(
                          roundedClaimedCoins,
                          order.tableName,
                          existingLoyalty?.loyaltyId?.toString() || "",
                          order._id.toString(),
                          order.userId.toString(),
                          session,
                        );
                        if (order.cashbackAvailable === false) {
                          cashBack = 0;
                        }
                      }

                      if (
                        existingLoyalty?.loyaltyId &&
                        order.userId.toString()
                      ) {
                        finalCashBack = await addCoins(
                          Math.round(cashBack),
                          order.userId.toString(),
                          order._id.toString(),
                          order.tableName || "",
                          order.businessId.toString(),
                          existingLoyalty?.loyaltyId.toString() || "",
                          session,
                        );
                        console.log("finalCashBack order 3", finalCashBack);
                        if (order.cashbackAvailable === false) {
                          cashBack = 0;
                        }
                      }
                    }
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
                          mode:
                            settleModes.length > 1
                              ? "split"
                              : paymentMode?.name,
                          status: "SUCCESS",
                          paymentMode:
                            settleModes.length > 1
                              ? "split"
                              : paymentMode?.name,
                          userId:
                            paymentMode?.name === "npc"
                              ? npcUser?.userId
                              : order?.userId,
                          claimedCoins:
                            paymentMode?.name === "npc" ||
                            paymentMode?.name === "complementary"
                              ? 0
                              : roundedClaimedCoins,
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
                          billId: splitBillTableSessionData?._id.toString(),
                          tax:
                            paymentMode?.name === "npc" ||
                            paymentMode?.name === "complementary"
                              ? 0
                              : splitBillTableSessionData?.gst,
                          serviceCharge:
                            paymentMode?.name === "npc" ||
                            paymentMode?.name === "complementary"
                              ? 0
                              : splitBillTableSessionData?.serviceCharge,
                          splitModes: settleModes,
                          waiterName,
                          date: Date.now(),
                          discount: splitBillTableSessionData?.discount,
                          couponDiscount:
                            splitBillTableSessionData?.couponDiscount,
                          billItems: splitBillTableSessionData?.items || [],
                          isSplitBillVariant: true,
                          billInvoice: splitBillTableSessionData?.billInvoice,
                          paxCount: tableSession?.paxCount || 0,
                          serviceChargePercentage:
                            tableSession?.serviceChargePercentage || 0,
                          roundOffType: tableSession?.roundOffType || 0,
                          roundOffAmount: tableSession?.roundOffAmount || 0,
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

                    await QrBill.findOneAndUpdate(
                      {
                        $or: [
                          {
                            billId: splitBillTableSessionData?._id?.toString(),
                          },
                        ],
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

                    await SplitBillTableSession.findOneAndUpdate(
                      { _id: order.variantId },
                      {
                        $set: {
                          isPaid: true,
                        },
                      },
                      { new: true, session },
                    );

                    await UserSession.findOneAndUpdate(
                      {
                        businessId: order.businessId,
                        tableName: order.tableName,
                      },
                      {
                        $inc: {
                          variantsCounts: -1,
                        },
                      },
                      { session },
                    );

                    await PaymentAlert.findByIdAndUpdate(
                      alertId,
                      { isAccepted: true, comment, waiterName },
                      { new: true, session },
                    );
                    console.log("triggered order 3");
                    // TODO monad integration
                    if (existingLoyalty?.loyaltyId) {
                      await monadHelperFunction({
                        businessId: order.businessId,
                        loyaltyId: existingLoyalty.loyaltyId,
                        userId: order.userId,
                        orderId: order.order_id,
                        claimedCoinz: roundedClaimedCoins,
                        earnedCoinz: finalCashBack,
                      });
                    }
                    return c.json({
                      message: "Order accepted successfully",
                      err: false,
                      data: {},
                    });
                  }

                  if (tableSession.variantsCounts === 1) {
                    const npcUser = await NpcUser.findById(npcUserId);

                    let finalCashBack = 0;
                    if (
                      paymentMode?.name !== "complementary" &&
                      paymentMode?.name !== "npc"
                    ) {
                      let cashBack = await calculatedCashbackCoins(
                        order.businessId.toString(),
                        Number(order.billValue),
                        roundedClaimedCoins,
                        Number(order.couponDiscount),
                        Number(order.discount),
                      );
                      console.log("cashBack order 4", cashBack);
                      if (
                        existingLoyalty?.loyaltyId &&
                        roundedClaimedCoins > 0 &&
                        order.userId.toString()
                      ) {
                        await removeCoins(
                          roundedClaimedCoins,
                          order.tableName,
                          existingLoyalty?.loyaltyId?.toString() || "",
                          order._id.toString(),
                          order.userId.toString(),
                          session,
                        );
                        if (order.cashbackAvailable === false) {
                          cashBack = 0;
                        }
                      }

                      if (
                        existingLoyalty?.loyaltyId &&
                        order.userId.toString()
                      ) {
                        finalCashBack = await addCoins(
                          Math.round(cashBack),
                          order.userId.toString(),
                          order._id.toString(),
                          order.tableName || "",
                          order.businessId.toString(),
                          existingLoyalty?.loyaltyId.toString() || "",
                          session,
                        );
                        console.log("finalCashBack order 4", finalCashBack);
                        if (order.cashbackAvailable === false) {
                          cashBack = 0;
                        }
                      }

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
                            mode:
                              settleModes.length > 1
                                ? "split"
                                : paymentMode?.name,
                            status: "SUCCESS",
                            paymentMode:
                              settleModes.length > 1
                                ? "split"
                                : paymentMode?.name,
                            userId:
                              paymentMode?.name === "npc"
                                ? npcUser?.userId
                                : order?.userId,
                            claimedCoins:
                              paymentMode?.name === "npc" ||
                              paymentMode?.name === "complementary"
                                ? 0
                                : roundedClaimedCoins,
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
                            billId: splitBillTableSessionData?._id.toString(),
                            tax:
                              paymentMode?.name === "npc" ||
                              paymentMode?.name === "complementary"
                                ? 0
                                : splitBillTableSessionData?.gst,
                            serviceCharge:
                              paymentMode?.name === "npc" ||
                              paymentMode?.name === "complementary"
                                ? 0
                                : splitBillTableSessionData?.serviceCharge,
                            splitModes: settleModes,
                            waiterName,
                            date: Date.now(),
                            discount: splitBillTableSessionData?.discount,
                            couponDiscount:
                              splitBillTableSessionData?.couponDiscount,
                            billItems: splitBillTableSessionData?.items || [],
                            isSplitBillVariant: true,
                            billInvoice: splitBillTableSessionData?.billInvoice,
                            paxCount: tableSession?.paxCount || 0,
                            serviceChargePercentage:
                              tableSession?.serviceChargePercentage || 0,
                            roundOffType: tableSession?.roundOffType || 0,
                            roundOffAmount: tableSession?.roundOffAmount || 0,
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

                      await QrBill.findOneAndUpdate(
                        {
                          $or: [
                            {
                              billId:
                                splitBillTableSessionData?._id?.toString(),
                            },
                          ],
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

                      await SplitBillTableSession.findOneAndUpdate(
                        { _id: order.variantId },
                        {
                          $set: {
                            isPaid: true,
                          },
                        },
                        { new: true, session },
                      );

                      await UserSession.findOneAndUpdate(
                        {
                          businessId: order.businessId,
                          tableName: order.tableName,
                        },
                        {
                          $inc: {
                            variantsCounts: -1,
                          },
                        },
                        { session },
                      );

                      await PaymentAlert.findByIdAndUpdate(
                        alertId,
                        { isAccepted: true, comment, waiterName },
                        { new: true, session },
                      );
                      if (existingLoyalty?.loyaltyId) {
                        // TODO monad integration
                        await monadHelperFunction({
                          businessId: order.businessId,
                          userId: order.userId,
                          orderId: order.order_id,
                          claimedCoinz: roundedClaimedCoins,
                          earnedCoinz: finalCashBack,
                        });
                      }
                    }
                  }
                  // dont place monad here
                  if (tableSession?.variantsCounts === 1) {
                    if (isHavePos) {
                      const payload = {
                        app_key: isHavePos.accessKey,
                        app_secret: isHavePos?.secretKey,
                        access_token: isHavePos.authToken,
                        restID: isHavePos?.restId,
                        pin: tableSession?.pin,
                        tableNo: tableSession?.tableName,
                      };

                      setTimeout(() => {
                        (async () => {
                          try {
                            // 1. Request the bill
                            const {
                              data: { bill_request_id },
                            } = await axios.post(
                              posApiPaths.requestBill,
                              payload,
                              {
                                headers: { "Content-Type": "application/json" },
                              },
                            );
                          } catch (err) {
                            console.error(
                              "Failed to request/settle bill:",
                              err,
                            );
                          }
                        })();
                      }, 10000);

                      setTimeout(() => {
                        (async () => {
                          try {
                            // 1. Request the bill
                            const {
                              data: { bill_request_id },
                            } = await axios.post(
                              posApiPaths.requestBill,
                              payload,
                              {
                                headers: { "Content-Type": "application/json" },
                              },
                            );

                            // 2. Settle the table
                            const { data: settleData } = await axios.post(
                              posApiPaths.settleTable,
                              {
                                app_key: isHavePos.accessKey,
                                app_secret: isHavePos.secretKey,
                                access_token: isHavePos.authToken,
                                restID: isHavePos.restId,
                                bill_request_id,
                                amount_paid: tableSession?.total,
                                pin: tableSession?.pin,
                              },
                            );

                            // 3. If settlement failed (success === "0"), upsert into UnsettleTable
                            if (settleData.success === "0") {
                              await UnsettleTable.findOneAndUpdate(
                                {
                                  businessId: order.businessId,
                                  tableName: order.tableName,
                                  pin: tableSession?.pin,
                                },
                                {
                                  sync: false,
                                  // <-- use settleData.request_id, not response.data.request_id
                                  requestId: settleData.request_id,
                                  pin: tableSession?.pin,
                                  restId: isHavePos.restId,
                                  date: Date.now(),
                                  total: tableSession?.total,
                                },
                                { new: true, upsert: true },
                              );
                            }
                            const unsettleTable = await UnsettleTable.find({
                              businessId: order.businessId,
                              restId: isHavePos.restId,
                              sync: false,
                            });

                            for (const table of unsettleTable) {
                              const payload = {
                                app_key: isHavePos.accessKey,
                                app_secret: isHavePos.secretKey,
                                access_token: isHavePos.authToken,
                                restID: isHavePos.restId,
                                pin: table?.pin,
                                tableNo: table?.tableName,
                              };

                              await axios.post(
                                posApiPaths.requestBill,
                                payload,
                                {
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                },
                              );
                            }
                          } catch (err) {
                            console.error(
                              "Failed to request/settle bill:",
                              err,
                            );
                          }
                        })();
                      }, 35000);

                      await KotOrder.updateMany(
                        {
                          tableName: order.tableName,
                          businessId: order.businessId,
                          settled: false,
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

                      const tableInfo = await Table.findOneAndUpdate(
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
                            isMerge: false,
                            mergeTableIds: [],
                            mergedBy: null,
                            isBillGenerated: false,
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
                      await MergeTable.deleteOne(
                        {
                          parentTableId: tableInfo?._id,
                        },
                        {
                          session,
                        },
                      );
                    }
                  }
                  console.log("triggered order 4");
                  return c.json({
                    message: "Order accepted successfully",
                    err: false,
                    data: {},
                  });
                }
              }
              let finalCashBack = 0;
              if (
                paymentMode?.name !== "complementary" &&
                paymentMode?.name !== "npc"
              ) {
                let cashBack = await calculatedCashbackCoins(
                  order.businessId.toString(),
                  Number(order.billValue),
                  roundedClaimedCoins,
                  Number(order.couponDiscount),
                  Number(order.discount),
                );

                if (existingLoyalty?.loyaltyId && roundedClaimedCoins > 0) {
                  await removeCoins(
                    roundedClaimedCoins,
                    order.tableName,
                    existingLoyalty?.loyaltyId?.toString() || "",
                    order._id.toString(),
                    order.userId.toString(),
                    session,
                  );
                  if (order.cashbackAvailable === false) {
                    cashBack = 0;
                  }
                }

                if (existingLoyalty?.loyaltyId) {
                  finalCashBack = await addCoins(
                    Math.round(cashBack),
                    order.userId.toString(),
                    order._id.toString(),
                    order.tableName || "",
                    order.businessId.toString(),

                    existingLoyalty?.loyaltyId.toString() || "",

                    session,
                  );
                }
              }

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
                        : roundedClaimedCoins,
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
                    billId: tableSession?._id.toString(),
                    tax:
                      paymentMode?.name === "npc" ||
                      paymentMode?.name === "complementary"
                        ? 0
                        : tableSession?.gst,
                    serviceCgarge:
                      paymentMode?.name === "npc" ||
                      paymentMode?.name === "complementary"
                        ? 0
                        : tableSession?.serviceCharge,
                    splitModes: settleModes,
                    waiterName,
                    date: Date.now(),
                    discount: tableSession?.discount || 0,
                    couponDiscount: tableSession?.couponDiscount || 0,
                    billItems: tableSession?.items || [],
                    billInvoice: tableSession?.billInvoice || 0,
                    paxCount: tableSession?.paxCount || 0,
                    serviceChargePercentage:
                      tableSession?.serviceChargePercentage || 0,
                    roundOffType: tableSession?.roundOffType || 0,
                    roundOffAmount: tableSession?.roundOffAmount || 0,
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
                const payload = {
                  app_key: isHavePos.accessKey,
                  app_secret: isHavePos?.secretKey,
                  access_token: isHavePos.authToken,
                  restID: isHavePos?.restId,
                  pin: tableSession?.pin,
                  tableNo: tableSession?.tableName,
                };

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
                          app_key: isHavePos.accessKey,
                          app_secret: isHavePos.secretKey,
                          access_token: isHavePos.authToken,
                          restID: isHavePos.restId,
                          bill_request_id,
                          amount_paid: modifyTotal,
                          pin: tableSession?.pin,
                        },
                      );

                      // 3. If settlement failed (success === "0"), upsert into UnsettleTable
                      if (settleData.success === "0") {
                        await UnsettleTable.findOneAndUpdate(
                          {
                            businessId: order.businessId,
                            tableName: order.tableName,
                            pin: tableSession?.pin,
                          },
                          {
                            sync: false,
                            // <-- use settleData.request_id, not response.data.request_id
                            requestId: settleData.request_id,
                            pin: tableSession?.pin,
                            restId: isHavePos.restId,
                            date: Date.now(),
                            total: modifyTotal,
                          },
                          { new: true, upsert: true },
                        );
                      }
                      const unsettleTable = await UnsettleTable.find({
                        businessId: order.businessId,
                        restId: isHavePos.restId,
                        sync: false,
                      });

                      for (const table of unsettleTable) {
                        const payload = {
                          app_key: isHavePos.accessKey,
                          app_secret: isHavePos.secretKey,
                          access_token: isHavePos.authToken,
                          restID: isHavePos.restId,
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

                await KotOrder.updateMany(
                  {
                    tableName: order.tableName,
                    businessId: order.businessId,
                    settled: false,
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

                const tableInfo = await Table.findOneAndUpdate(
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
                      isMerge: false,
                      mergeTableIds: [],
                      mergedBy: null,
                      isBillGenerated: false,
                    },
                  },
                  {
                    session,
                  },
                );
                await QrBill.findOneAndUpdate(
                  {
                    billId: tableSession?._id.toString(),
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

                await MergeTable.deleteOne(
                  {
                    parentTableId: tableInfo?._id,
                  },
                  {
                    session,
                  },
                );
              }
              // TODO monad integration
              await monadHelperFunction({
                businessId: order.businessId,
                loyaltyId: existingLoyalty?.loyaltyId,
                userId: order.userId,
                orderId: order.order_id,
                claimedCoinz: roundedClaimedCoins,
                earnedCoinz: finalCashBack,
              });
            }

            const updateAlert = await PaymentAlert.findByIdAndUpdate(
              alertId,
              { isAccepted: true, comment, waiterName },
              { new: true, session },
            );
            console.log("triggered order 5");
            return c.json({
              message: "Order accepted successfully",
              err: false,
              data: updateAlert,
            });
          }
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

  .get("/:id/salesDashboard", zValidator("query", paramsSchema), async (c) => {
    const { businessId, from, to } = c.req.query();

    // Safer date parsing
    const fromDate = !isNaN(Number(from))
      ? Number(from)
      : startOfToday.getTime();
    const toDate = !isNaN(Number(to)) ? Number(to) : endOfToday.getTime();

    const isToday = isTodayIST(fromDate);
    const dateRange = getISTDateRange(Date.now());
    console.log(businessId, from, to, { isToday, dateRange });

    if (fromDate > toDate) {
      return c.json({
        err: true,
        data: {},
        message: "from date should be less than to date",
      });
    }

    // 🔹 SINGLE QUERY: include ALL modes (including dues) so invoice range is correct
    const payments = await Payment.find(
      {
        businessId,
        isDeleted: false,
        date: { $gte: fromDate, $lte: toDate },
      },
      {
        total: 1,
        paymentMode: 1,
        mode: 1,
        splitModes: 1,
        tax: 1,
        serviceCharge: 1,
        tips: 1,
        discount: 1,
        paxCount: 1,
        billValue: 1,
        claimedCoins: 1,
        couponDiscount: 1,
        billInvoice: 1,
        roundOffType: 1,
        roundOffAmount: 1,
      },
    ).sort({ billInvoice: 1 });

    console.log("payments length:", payments.length);

    // 👉 Invoice range uses ALL payments (including dues)
    const startInvoiceNumber = payments[0]?.billInvoice || 0;
    const endInvoiceNumber = payments[payments.length - 1]?.billInvoice || 0;

    let overAllAmount = 0; // this is raw sum (with round-off)
    let totalOnlineSale = 0;
    let totalPaxCount = 0;
    const offlineSales: Record<string, number> = {};

    let subTotalSum = 0;
    let taxSum = 0;
    let serviceChargeSum = 0;
    let tipSum = 0;
    let discountSum = 0;
    let totalOrders = 0;

    // 🔹 net round off for the period (plus - minus)
    let totalRoundOff = 0;

    const activeTable = await Table.find({
      businessId: businessId,
      status: "ACTIVE",
    });

    const totalActiveTableValue = activeTable.reduce((acc, table) => {
      return acc + (table?.currentTableAmount ?? 0);
    }, 0);

    for (const payment of payments) {
      const {
        total = 0,
        paymentMode,
        mode,
        splitModes,
        paxCount = 0,
        billValue = 0,
        roundOffType = 0,
        roundOffAmount = 0,
      } = payment as any;

      // ❌ Skip dues from all sales metrics
      if (mode === "dues") {
        continue;
      }

      totalOrders += 1; // ✅ only non-dues counted as orders
      totalPaxCount += paxCount;

      // 🔹 accumulate net round-off
      if (roundOffAmount) {
        if (roundOffType === 1) {
          // plus
          totalRoundOff += roundOffAmount;
        } else {
          // 0 = minus
          totalRoundOff -= roundOffAmount;
        }
      }

      // 🧮 SPLIT BILLS – handle each settle separately
      if (mode === "split" && Array.isArray(splitModes)) {
        let splitTotal = 0;

        for (const settle of splitModes) {
          const settleName = settle?.name;
          const amt = settle?.amount ?? 0;

          // Exclude dues / npc / complementary from revenue & breakdown
          if (["dues", "npc", "complementary"].includes(settleName)) continue;

          splitTotal += amt;

          if (settleName === "online") {
            totalOnlineSale += amt;
          } else {
            offlineSales[settleName] = (offlineSales[settleName] || 0) + amt;
          }
        }

        // Raw sales including round-off effect
        overAllAmount += splitTotal;
      } else {
        // 🧮 NON-SPLIT BILL

        // Exclude npc & complementary from overAllAmount
        if (!["npc", "complementary"].includes(mode)) {
          overAllAmount += total;
        }

        // Online vs offline – ignore npc/complementary/dues as payment modes
        if (paymentMode === "online") {
          totalOnlineSale += total;
        } else if (!["dues", "npc", "complementary"].includes(paymentMode)) {
          // group offline sales by paymentMode (cash/card/upi/etc)
          offlineSales[paymentMode] = (offlineSales[paymentMode] || 0) + total;
        }
      }

      // 🧮 Bill-level components (dues already skipped above)
      subTotalSum += billValue;
      taxSum += payment.tax || 0;
      serviceChargeSum += payment.serviceCharge || 0;
      tipSum += payment.tips || 0;
      discountSum += payment.discount || 0;
    }

    // Just in case, but dues / split keys shouldn't be present now
    delete offlineSales["complementary"];
    delete offlineSales["split"];
    delete offlineSales["dues"];

    // 🔹 Final: remove net round-off from overall sales
    const overAllAmountWithoutRoundOff = overAllAmount - totalRoundOff;

    return c.json({
      err: false,
      data: {
        overAllAmount: overAllAmountWithoutRoundOff,
        totalRoundOff,

        onlineSale: { online: totalOnlineSale },
        offlineSale: offlineSales,
        totalOrders,

        totalActiveTableValue,
        subTotal: subTotalSum,
        totalTax: taxSum,
        totalServiceCharge: serviceChargeSum,
        totalTip: tipSum,
        totalDiscount: discountSum,
        totalPaxCount: totalPaxCount || 0,
        startInvoiceNumber, // ✅ includes dues in range
        endInvoiceNumber, // ✅ includes dues in range
      },
    });
  })

  .get(
    "/:id/unified_sales_dashboard",
    zValidator("query", paramsSchema),
    async (c) => {
      const { businessId, from, to } = c.req.query();

      const fromDate = !isNaN(Number(from))
        ? Number(from)
        : startOfToday.getTime();
      const toDate = !isNaN(Number(to)) ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return c.json(
          {
            err: true,
            data: {},
            message: "from date should be less than to date",
          },
          400,
        );
      }

      const payments = await Payment.find(
        {
          businessId,
          isDeleted: false,
          date: { $gte: fromDate, $lte: toDate },
        },
        {
          mode: 1,
          paymentMode: 1,
          splitModes: 1,
          settleType: 1,
          paxCount: 1,
          billValue: 1,
          tax: 1,
          serviceCharge: 1,
          tips: 1,
          discount: 1,
          claimedCoins: 1,
          couponDiscount: 1,
          total: 1,
          billInvoice: 1,
          roundOffType: 1,
          roundOffAmount: 1,
        },
      ).sort({ billInvoice: 1 });

      const activeTables = await Table.find({
        businessId,
        status: "ACTIVE",
      }).select("name currentTableAmount");

      const runningTables = activeTables
        .filter((t) => (t.currentTableAmount ?? 0) > 0)
        .map((t) => ({
          id: t._id.toString(),
          name: t.name,
          amount: t.currentTableAmount ?? 0,
        }));

      const totalActiveTableValue = runningTables.reduce(
        (sum, t) => sum + t.amount,
        0,
      );

      const core = buildUnifiedDashboardCore(payments as any);

      return c.json({
        err: false,
        data: {
          dateRange: { from: fromDate, to: toDate },
          ...core,
          runningTables: {
            totalActiveTableValue,
            tables: runningTables,
          },
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
      let { appliedFilter, appliedFilters, businessId, from, to, pageNumber } =
        c.req.query();

      const fromDate = Number(from) || startOfToday.getTime();
      const toDate = Number(to) || endOfToday.getTime();

      if (fromDate > toDate) {
        return c.json(
          {
            err: true,
            data: {},
            message: "from date should be less than to date",
          },
          400,
        );
      }

      const PAGE_SIZE = 20;
      const skip = (Number(pageNumber || 1) - 1) * PAGE_SIZE;

      // 1) Normalise filter input
      let parsedFilters: any[] = [];
      const rawFilter = appliedFilter || appliedFilters;

      if (rawFilter) {
        try {
          parsedFilters =
            typeof rawFilter === "string" ? JSON.parse(rawFilter) : rawFilter;
        } catch (e) {
          console.error("Invalid appliedFilter", rawFilter);
          parsedFilters = [];
        }
      }

      // 2) Base conditions
      const filterConditions: any[] = [
        { businessId },
        {
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      ];

      // 3) Apply filters
      if (Array.isArray(parsedFilters) && parsedFilters.length > 0) {
        for (const f of parsedFilters) {
          if (!f?.key || !Array.isArray(f.value)) continue;

          // Mode filter (dynamic)
          if (f.key === "mode") {
            const modesList = f.value.map((x: string) => x.toLowerCase());
            filterConditions.push({
              paymentMode: { $in: modesList },
            });
          }

          // Discount type filter (numeric-based)
          if (f.key === "type") {
            const values: string[] = f.value || [];
            const orConditions: any[] = [];

            if (values.includes("Coinz")) {
              orConditions.push({ claimedCoins: { $gt: 0 } });
            }

            if (values.includes("Couponz")) {
              orConditions.push({ couponDiscount: { $gt: 0 } });
            }

            if (values.includes("Discount")) {
              orConditions.push({ discount: { $gt: 0 } });
            }

            if (values.includes("No Rewardz")) {
              orConditions.push({
                claimedCoins: 0,
                couponDiscount: 0,
                discount: 0,
              });
            }

            if (orConditions.length > 0) {
              filterConditions.push({ $or: orConditions });
            }
          }
        }
      }

      const queryObject = {
        $and: filterConditions,
        isDeleted: false,
      };

      const existingPayments = await Payment.find(queryObject)
        .sort({ billInvoice: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate({ path: "order_id" })
        .populate({ path: "userId", select: "name phone" });

      let totalSale = 0;

      for (const payment of existingPayments) {
        const { total, mode, splitModes } = payment;

        if (mode === "split" && Array.isArray(splitModes)) {
          let sum = 0;
          for (const s of splitModes) {
            if (s.name !== "complementary") {
              sum += s.amount || 0;
            }
          }
          totalSale += sum;
        } else if (
          !["npc", "dues", "complementary"].includes((mode || "").toLowerCase())
        ) {
          totalSale += total ?? 0;
        }
      }

      return c.json({
        err: false,
        data: {
          totalSale,
          existingPayments,
        },
        message: "existing payment",
      });
    },
  )

  .post(
    "/filter_bills",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(24).max(24),
        billId: z.string().optional(),
        billInvoice: z.number().optional(),
        billNo: z.union([z.number(), z.string()]).optional(),
        tableName: z.string().optional(),
        total: z.number().optional(),
        userName: z.string().optional(),
        userPhone: z.string().optional(),
      }),
    ),
    async (c) => {
      const {
        businessId,
        billId,
        billInvoice,
        billNo,
        tableName,
        total,
        userName,
        userPhone,
      } = await c.req.json();

      const filterConditions: any[] = [{ businessId }, { isDeleted: false }];

      // 🔹 Bill ID (internal string)
      if (billId && billId.trim() !== "") {
        filterConditions.push({ billId });
      }

      // 🔹 Bill Invoice (number)
      if (typeof billInvoice === "number") {
        filterConditions.push({ billInvoice });
      }

      // 🔹 Bill No (stored as Number in Payment schema)
      if (typeof billNo === "number") {
        filterConditions.push({ billNo });
      } else if (typeof billNo === "string" && billNo.trim() !== "") {
        const billNoNum = Number(billNo);
        if (!Number.isNaN(billNoNum)) {
          filterConditions.push({ billNo: billNoNum });
        }
      }

      // 🔹 Table name (case-insensitive partial match)
      if (tableName && tableName.trim() !== "") {
        filterConditions.push({ tableName: new RegExp(tableName.trim(), "i") });
      }

      // 🔹 Exact total match
      if (typeof total === "number") {
        filterConditions.push({ total });
      }

      // 🔹 User search by name / phone (via User collection)
      if (
        (userName && userName.trim() !== "") ||
        (userPhone && userPhone.trim() !== "")
      ) {
        const userQuery: any = {};

        if (userName && userName.trim() !== "") {
          userQuery.name = new RegExp(userName.trim(), "i");
        }

        if (userPhone && userPhone.trim() !== "") {
          userQuery.phone = new RegExp(userPhone.trim(), "i");
        }

        const users = await User.find(userQuery).select("_id");
        const userIds = users.map((u) => u._id);

        if (userIds.length === 0) {
          return c.json({
            err: false,
            data: {
              existingPayments: [],
              totalSale: 0,
            },
            message: "No payments found",
          });
        }

        filterConditions.push({ userId: { $in: userIds } });
      }

      const queryObject = { $and: filterConditions };

      const existingPayments = await Payment.find(queryObject)
        .sort({ _id: -1 })
        .populate({ path: "order_id" })
        .populate({ path: "userId", select: "name phone" });

      // 🔹 Compute totalSale with split logic
      let totalSale = 0;

      for (const payment of existingPayments) {
        const { total = 0, mode, splitModes } = payment;
        const modeLower = (mode || "").toLowerCase();

        if (modeLower === "split" && Array.isArray(splitModes)) {
          let splitTotal = 0;

          for (const settle of splitModes) {
            if ((settle?.name || "").toLowerCase() !== "complementary") {
              splitTotal += settle.amount ?? 0;
            }
          }

          totalSale += splitTotal;
        } else if (!["dues", "npc", "complementary"].includes(modeLower)) {
          totalSale += total;
        }
      }

      return c.json({
        err: false,
        data: {
          existingPayments,
          totalSale,
        },
        message: "Filtered payments retrieved successfully",
      });
    },
  )

  .get("/:id/bills_csv", zValidator("query", paramsSchema), async (c) => {
    const {
      appliedFilter,
      appliedFilters, // support both
      businessId,
      from,
      to,
    } = c.req.query();

    const fromDate = Number(from) || startOfToday.getTime();
    const toDate = Number(to) || endOfToday.getTime();

    if (fromDate > toDate) {
      return c.json(
        {
          err: true,
          data: {},
          message: "from date should be less than to date",
        },
        400,
      );
    }

    // ---------------- FILTER PARSING ----------------
    let parsedFilters: any[] = [];
    const rawFilter = appliedFilter || appliedFilters;

    if (rawFilter) {
      try {
        parsedFilters =
          typeof rawFilter === "string" ? JSON.parse(rawFilter) : rawFilter;
      } catch (err) {
        console.error("Failed to parse appliedFilter", rawFilter);
        parsedFilters = [];
      }
    }

    const filterConditions: any[] = [
      { businessId },
      {
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      },
    ];

    if (Array.isArray(parsedFilters) && parsedFilters.length > 0) {
      for (const f of parsedFilters) {
        if (!f?.key || !Array.isArray(f.value)) continue;

        if (f.key === "mode") {
          const modesList = f.value as string[];
          if (modesList.length > 0) {
            filterConditions.push({
              paymentMode: { $in: modesList },
            });
          }
        }

        if (f.key === "type") {
          const values: string[] = f.value || [];
          const orConditions: any[] = [];

          if (values.includes("Coinz")) {
            orConditions.push({ claimedCoins: { $gt: 0 } });
          }

          if (values.includes("Couponz")) {
            orConditions.push({ couponDiscount: { $gt: 0 } });
          }

          if (values.includes("Discount")) {
            orConditions.push({ discount: { $gt: 0 } });
          }

          if (values.includes("No Rewardz")) {
            orConditions.push({
              claimedCoins: 0,
              couponDiscount: 0,
              discount: 0,
            });
          }

          if (orConditions.length > 0) {
            filterConditions.push({ $or: orConditions });
          }
        }
      }
    }

    const baseQuery = {
      $and: filterConditions,
      isDeleted: false,
    };

    // ---------------- FETCH ALL MATCHED PAYMENTS ONCE ----------------
    const allPayments = await Payment.find(baseQuery)
      .sort({ billInvoice: 1 })
      .populate({ path: "order_id" })
      .populate({ path: "userId", select: "name phone" });

    const business = await OutLetInfo.findOne({ businessId }).select("name");
    const businessName = business?.name || "Business";

    // ---------------- BUILD EXCEL BUFFER VIA HELPER ----------------
    const buffer = await buildBillsExcelBuffer({
      payments: allPayments,
      businessName,
      fromDate,
      toDate,
    });

    const formatDate = (timestamp: number) => {
      const d = new Date(timestamp);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(d.getDate()).padStart(2, "0")}`;
    };

    const fromStr = formatDate(fromDate);
    const toStr = formatDate(toDate);
    const fileName = `payments_${fromStr}_to_${toStr}.xlsx`;

    c.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8",
    );
    c.header(
      "Content-Disposition",
      `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(
        fileName,
      )}`,
    );

    return c.body(buffer);
  })

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

      const groupAnalytics = await GroupAnalytic.find({
        businessId,
        isDefault: true,
      })
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

        avgSpend: z.string().optional(),
        visitCount: z.string().optional(),
        pageNumber: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to, avgSpend, visitCount } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const PAGE_SIZE = 100;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber || 1) - 1) * PAGE_SIZE;

      const existingUserAnalytics = await UserAnalytic.find({
        businessId,
      })
        .populate("userId")
        .skip(skip)
        .limit(PAGE_SIZE);

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
    "/users/Analytics/today",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const todayStart = startOfDay(new Date()).getTime();
      const todayEnd = endOfDay(new Date()).getTime();
      const todaysAnalytics = await UserAnalytic.find({
        businessId,
        dateOfJoining: { $gte: todayStart, $lte: todayEnd },
      }).populate("userId");
      return c.json(
        {
          data: todaysAnalytics,
          message: "Today's analytics fetched successfully",
          err: false,
        },
        200,
      );
    },
  )
  .get(
    "/users/Analytics/filter",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        search: z.string().optional(),
        spendMin: z.string().optional(),
        spendMax: z.string().optional(),
        totalSpendMin: z.string().optional(),
        totalSpendMax: z.string().optional(),
        visitsMin: z.string().optional(),
        visitsMax: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        pageNumber: z.string().optional(),
      }),
    ),
    async (c) => {
      const queryParams = c.req.query();
      const { pageNumber } = queryParams;

      const query = await buildUserAnalyticsFilterQuery(queryParams);

      const page = Number(pageNumber) || 1;
      const limit = 5000;
      const skip = (page - 1) * limit;

      // Execute
      const filteredResults = await UserAnalytic.find(query)
        .populate("userId")
        .skip(skip)
        .limit(limit);

      const totalCount = await UserAnalytic.countDocuments(query);

      return c.json(
        {
          data: filteredResults,
          totalCount,
          page,
          message: "Filtered analytics fetched successfully",
          err: false,
        },
        200,
      );
    },
  )
  // Full CSV export of the clients list — same filters as
  // /users/Analytics/filter but NO row cap, so a date-range or
  // visits-only selection always downloads the complete result.
  .get(
    "/users/Analytics/download_csv",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        search: z.string().optional(),
        spendMin: z.string().optional(),
        spendMax: z.string().optional(),
        totalSpendMin: z.string().optional(),
        totalSpendMax: z.string().optional(),
        visitsMin: z.string().optional(),
        visitsMax: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        scope: z.enum(["filtered", "all"]).optional(),
      }),
    ),
    async (c) => {
      const queryParams = c.req.query();

      const dateWindow = validateUserAnalyticsCsvDateWindow(queryParams);
      if (!dateWindow.valid) {
        return respond(c, dateWindow.message, true, 400);
      }

      const query = await buildUserAnalyticsFilterQuery(queryParams);

      // Safety valve: the export is one row per customer, and downloads are
      // already capped to a 6-month join-date window above. Keep a hard row
      // ceiling too, so unusually large businesses still get a clear response.
      const MAX_EXPORT_ROWS = 75_000;
      const exportCount = await UserAnalytic.countDocuments(query);
      if (exportCount > MAX_EXPORT_ROWS) {
        return respond(
          c,
          `This export has ${exportCount.toLocaleString()} customers — please narrow the filters (max ${MAX_EXPORT_ROWS.toLocaleString()} per download)`,
          true,
          413,
          { exportCount, max: MAX_EXPORT_ROWS },
        );
      }

      const rows: string[][] = [
        [
          "NAME",
          "PHONE",
          "VISITS",
          "TOTAL_SPEND",
          "AVG_SPEND",
          "COINZ_ISSUED",
          "COINZ_USED",
          "CURRENT_COINZ",
          "DATE_OF_JOINING",
        ],
      ];

      // Cursor — constant memory regardless of result size (no 5000 cap)
      const cursor = UserAnalytic.find(query)
        .populate({ path: "userId", select: "name phone" })
        .cursor();

      for await (const item of cursor) {
        const user = item.userId as unknown as {
          name?: string;
          phone?: string;
        } | null;
        rows.push([
          user?.name ?? "N/A",
          user?.phone ?? "N/A",
          String(item.visitCount ?? 0),
          String(item.totalSpend ?? 0),
          String(item.avgSpend ?? 0),
          String(item.coinzIssued ?? 0),
          String(item.coinzUsed ?? 0),
          String(item.currentCoins ?? 0),
          item.dateOfJoining
            ? new Date(Number(item.dateOfJoining)).toLocaleDateString("en-IN")
            : "",
        ]);
      }

      const csvString = rows
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

      const dateTag = new Date().toISOString().slice(0, 10);
      c.header("Content-Type", "text/csv");
      c.header(
        "Content-Disposition",
        `attachment; filename="customers_${dateTag}.csv"`,
      );
      return c.body(csvString);
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
      const userTotalSale = await UserAnalytic.findOne({ userId, businessId })
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

        await UserTags.deleteMany({
          userId,
          tagId: { $in: removeTagIds },
        });
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

  .get(
    "/sale/exception_and_rewards",
    // authTokenValidator,
    // requireAuthorization([
    //   ClientRoles.OWNER,
    //   ClientRoles.HIPAL_CUSTOMER,
    //   ClientRoles.CAPTAIN,
    // ]),
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
      const isToday = isTodayIST(fromDate);
      const dateRange = getISTDateRange(Date.now());

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
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      });

      let totalDiscount = 0;
      let totalDuesGiven = 0;
      let totalCouponDiscount = 0;
      let totalNpc = 0;
      let totalComplementary = 0;
      let totalCoinsGiven = 0;
      let totalCoinsUsed = 0;
      let totalDuesGetBack = 0;

      for (const payment of payments) {
        if (payment.mode !== "dues") {
          totalDiscount += payment.discount ?? 0;
        }

        if (payment.mode === "dues") {
          totalDuesGiven += payment.total;
        }

        if (payment.mode === "npc") {
          totalNpc += payment.billValue;
        }

        if (payment.settleType === "DUES_SETTLE") {
          totalDuesGetBack += payment.total;
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

        if (payment.claimedCoins && !payment.couponId) {
          totalCoinsUsed += payment.claimedCoins ?? 0;
        }

        if (payment.couponDiscount > 0) {
          totalCouponDiscount += payment.couponDiscount ?? 0;
        }
      }

      return c.json({
        err: false,
        data: {
          exceptionSale: {
            totalDuesGiven,
            totalDuesGetBack,
            totalNpc,
            totalComplementary,
            totalDiscount,
          },
          rewardSale: {
            totalCoinsGiven,
            totalCoinsUsed,
            totalCouponDiscount,
          },
        },
      });
    },
  )

  .get(
    "/sale/other_and_warnings",
    // authTokenValidator,
    // requireAuthorization([
    //   ClientRoles.OWNER,
    //   ClientRoles.HIPAL_CUSTOMER,
    //   ClientRoles.CAPTAIN,
    // ]),
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

      // Safer date parsing (same pattern as salesDashboard)
      const fromDate = !isNaN(Number(from))
        ? Number(from)
        : startOfToday.getTime();
      const toDate = !isNaN(Number(to)) ? Number(to) : endOfToday.getTime();

      const isToday = isTodayIST(fromDate);
      const dateRange = getISTDateRange(Date.now());

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      // 🔹 EXCLUDE dues COMPLETELY
      const payments = await Payment.find({
        businessId,
        isDeleted: false,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
        mode: { $ne: "dues" },
      });

      let totalTax = 0;
      let totalTip = 0;
      let totalServiceCharge = 0;

      for (const payment of payments) {
        totalTax += payment.tax ?? 0;
        totalTip += payment.tips ?? 0;
        totalServiceCharge += payment.serviceCharge ?? 0;
      }

      return c.json({
        err: false,
        data: {
          otherSale: {
            totalTax: Math.round(totalTax),
            totalTip,
            totalServiceCharge: Math.round(totalServiceCharge),
          },
          warningSale: {},
        },
      });
    },
  )

  .put(
    "/update_mode",

    zValidator(
      "json",
      z.object({
        paymentId: z.string(),
        mode: z.string(),
        updatedBy: z.string(),
      }),
    ),

    async (c) => {
      const { paymentId, mode, updatedBy } = await c.req.json();

      const paymentData = await Payment.findById(paymentId);

      if (!paymentData) {
        return c.json({
          err: true,
          data: {},
          message: "Payment not found",
        });
      }
      if (
        (paymentData?.splitModes?.length ?? 0) > 1 ||
        ["complementary", "dues", "npc", "split"].includes(paymentData.mode)
      ) {
        return c.json({
          err: true,
          data: {},
          message: "Payment already settled or cannot update mode",
        });
      }

      const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        {
          mode,
          paymentMode: mode,
          splitModes: [],
          updatedBy: updatedBy,
          updatedAt: Date.now(),
        },
        { new: true },
      );

      if (!updatedPayment) {
        return c.json({
          err: true,
          data: {},
          message: "Failed to update payment",
        });
      }

      return respond(c, "Payment mode updated successfully", false, 200, {
        _id: updatedPayment._id,
      });
    },
  )
  .get(
    "/:id/test_salesDashboard",
    zValidator("query", paramsSchema),
    async (c) => {
      const { businessId, from, to } = c.req.query();

      // Adjust `from` and `to` timestamps based on whether they are today's date or not
      const { adjustedFrom, adjustedTo } = adjustFromToTimestamps(
        Number(from),
        Number(to),
      );

      // Use the adjusted timestamps as `fromDate` and `toDate`
      const fromDate = adjustedFrom;
      const toDate = adjustedTo;

      // Ensure `fromDate` is less than `toDate`
      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      // Query for payments within the adjusted date range
      const payments = await Payment.find({
        businessId,
        isDeleted: false,
        date: { $gte: fromDate, $lte: toDate },
      });

      const totalOrders = payments.length;

      let overAllAmount = 0;
      let totalOnlineSale = 0;
      const offlineSales: Record<string, number> = {};

      // Fetch active tables
      const activeTable = await Table.find({
        businessId: businessId,
        status: "ACTIVE",
      });

      const totalActiveTableValue = activeTable.reduce((acc, table) => {
        return acc + (table?.currentTableAmount ?? 0);
      }, 0);

      // Process the payments
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

      // Clean up complementary and split modes
      delete offlineSales["complementary"];
      delete offlineSales["split"];

      // Return the response with the data
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
    "/fetch_bill_by_order_id",

    zValidator(
      "query",
      z.object({
        orderId: z.string(),
      }),
    ),

    async (c) => {
      const { orderId } = c.req.query();

      const payment = await Payment.findOne({
        order_id: orderId,
      });

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
        message: "Payment found",
      });
    },
  );

export default paymentsRouter;
