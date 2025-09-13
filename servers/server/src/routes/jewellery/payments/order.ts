import { DeviceToken, JewelleryOrder } from "@hi/db-models";
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
          order_id: response.id,
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

        // await PaymentAlert.create(
        //   [
        //     {
        //       businessId: businessId,
        //       userId: userId,
        //       alertType: "OFFLINE",
        //       order_id: saveOrder?.[0]._id,
        //       status: "SUCCESS",
        //       tableName: tableName,
        //       coinsApplied: !!(
        //         tableSession?.claimedCoins && tableSession.claimedCoins > 0
        //       ),
        //       message: `Paid ${total}`,
        //       date: Date.now(),
        //       billId: tableSession?._id.toString(),
        //       mode: "OFFLINE",
        //     },
        //   ],
        //   { session },
        // );
        const registrationToken = await DeviceToken.find({
          businessId: businessId,
        });

        return respond(c, "Order created successfully", false, 200, {
          order_id: saveOrder?.[0]._id,
        });
      });
    },
  );
//   .post(
//     "/validPayment/:merchantId",

//     zValidator("json", validatePaymentSchema),
//     zValidator("param", z.object({ merchantId: z.string() })),
//     zValidator(
//       "query",
//       z.object({
//         userId: z.string().optional(),
//         couponId: z.string().optional(),
//         tableName: z.string().optional(),
//         businessId: z.string().optional(),
//         paidAmount: z.string().optional(),
//       }),
//     ),

//     async (c) => {
//       const requestData = await c.req.json();
//       const { response } = requestData;
//       const { merchantId } = c.req.param();
//       const { userId, couponId, businessId, tableName, paidAmount } =
//         c.req.query();
//       const merchantConfig = (await getMerchantConfig(
//         merchantId,
//       )) as MerchantConfig;
//       let RAZORPAY_SECRET = "";

//       if (!merchantConfig) {
//         const merchant = await BusinessSettings.findOne({
//           razorpayMerchantId: merchantId,
//         }).select("razorpayKeySecret");
//         RAZORPAY_SECRET = merchant?.razorpayKeySecret as string;
//       } else {
//         RAZORPAY_SECRET = merchantConfig.razorpayKeySecret;
//       }

//       if (!RAZORPAY_SECRET)
//         return respond(
//           c,
//           "razorpay_secret missing while validating payments",
//           true,
//           400,
//           {},
//         );

//       const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
//         response;

//       if (userId && couponId) {
//         let userClaim = await UserCouponClaim.findOne({ userId, couponId });
//         let couponClaim = await CouponClaim.findOne({ couponId });

//         const currentDate = Date.now();
//         const oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
//         const oneMonth = 30 * 24 * 60 * 60 * 1000;

//         if (!userClaim) {
//           userClaim = await UserCouponClaim.create({
//             userId,
//             couponId,
//             date: currentDate,
//             weekelyLastResetDate: currentDate,
//             monthlyLastResetDate: currentDate,
//             weeklyLimit: 0,
//             monthlyLimit: 0,
//             overAllLimit: 0,
//           });
//         }

//         if (!couponClaim) {
//           couponClaim = await CouponClaim.create({
//             couponId,
//             date: currentDate,
//             weekelyLastResetDate: currentDate,
//             monthlyLastResetDate: currentDate,
//             weeklyLimit: 0,
//             monthlyLimit: 0,
//             overAllLimit: 0,
//           });
//         }

//         // Function to reset limits if necessary
//         const resetLimitsIfNecessary = (claim, type) => {
//           if (
//             type === "weekly" &&
//             currentDate - claim.weekelyLastResetDate >= oneWeek
//           ) {
//             claim.weeklyLimit = 0;
//             claim.weekelyLastResetDate = currentDate;
//           }
//           if (
//             type === "monthly" &&
//             currentDate - claim.monthlyLastResetDate >= oneMonth
//           ) {
//             claim.monthlyLimit = 0;
//             claim.monthlyLastResetDate = currentDate;
//           }
//         };

//         // Reset limits if necessary
//         resetLimitsIfNecessary(userClaim, "weekly");
//         resetLimitsIfNecessary(userClaim, "monthly");
//         resetLimitsIfNecessary(couponClaim, "weekly");
//         resetLimitsIfNecessary(couponClaim, "monthly");

//         // Function to update limits
//         const updateLimits = (claim: {
//           overAllLimit: number;
//           weeklyLimit: number;
//           monthlyLimit: number;
//         }) => {
//           claim.overAllLimit += 1;
//           claim.weeklyLimit += 1;
//           claim.monthlyLimit += 1;
//         };

//         // Update limits
//         updateLimits(userClaim);
//         updateLimits(couponClaim);

//         // Save the updated claims
//         await userClaim.save();
//         await couponClaim.save();
//         const couponz = await Couponz.findById(couponId).select(
//           "conditions.individualUserLimit conditions.expiryClaimLimit businessId",
//         );

//         if (!couponz) {
//           return c.json(
//             {
//               err: true,
//               message: "Coupon not found",
//               data: razorpay_order_id,
//             },
//             200,
//           );
//         }

//         const individualUserLimit = couponz?.conditions?.individualUserLimit;
//         const expiryClaimLimit = couponz?.conditions?.expiryClaimLimit;
//         const userClaimLimit =
//           individualUserLimit && "overAllLimit" in individualUserLimit
//             ? individualUserLimit.overAllLimit
//             : 0;
//         const couponClaimLimit =
//           expiryClaimLimit && "overAllLimit" in expiryClaimLimit
//             ? expiryClaimLimit.overAllLimit
//             : 0;

//         const couponOverAllLimit = (await CouponClaim.findOne({
//           couponId,
//         }).select("overAllLimit")) ?? { overAllLimit: 0 };
//         const userOverAllLimit = (await UserCouponClaim.findOne({
//           userId,
//           couponId,
//         }).select("overAllLimit")) ?? { overAllLimit: 0 };

//         if (userClaimLimit > 0) {
//           if (userOverAllLimit?.overAllLimit >= userClaimLimit) {
//             const expireAfterClaiming = await UserCouponGrabb.findOneAndUpdate(
//               {
//                 userId,
//                 couponId,
//               },
//               { $set: { isDeleted: true } },
//             );
//             if (!expireAfterClaiming) {
//               const createGrabb = await UserCouponGrabb.create({
//                 userId,
//                 couponId,
//                 date: Date.now(),
//                 isDeleted: true,
//                 businessId: couponz?.businessId,
//                 expiryDate: Date.now(),
//               });
//               if (!createGrabb) {
//                 return c.json(
//                   {
//                     err: true,
//                     message: "Coupon not found",
//                     data: razorpay_order_id,
//                   },
//                   200,
//                 );
//               }
//             }
//           }
//         }

//         if (couponClaimLimit > 0) {
//           if (couponOverAllLimit?.overAllLimit >= couponClaimLimit) {
//             await Couponz.findOneAndUpdate(
//               {
//                 _id: couponId,
//               },
//               { $set: { isActive: false, isDeleted: true } },
//             );
//           }
//         }
//       }

//       const signature = createHmac("sha256", RAZORPAY_SECRET)
//         .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//         .digest("hex");

//       const registrationToken = await DeviceToken.find({
//         businessId: businessId,
//       });

//       if (signature === razorpay_signature) {
//         return c.json({
//           err: false,
//           message: "Payment is valid",
//           data: razorpay_order_id,
//         });
//       }
//       return c.json(
//         {
//           err: true,
//           message: "Payment is invalid",
//           data: {},
//         },
//         400,
//       );
//     },
//   );
//   .post("/razorpay-webhook/:merchantId", async (c) => {
//     //@ts-ignore
//     return runInTransaction(async (session: ClientSession) => {
//       const { merchantId } = c.req.param();
//       const merchantConfig = (await getMerchantConfig(
//         merchantId,
//       )) as MerchantConfig;

//       let RAZORPAY_WEBHOOK_SECRET = "";
//       const body = await c.req.json();
//       if (!merchantConfig) {
//         const merchant = await BusinessSettings.findOne({
//           razorpayMerchantId: merchantId,
//         }).select("razorpayWebhookSecret");
//         RAZORPAY_WEBHOOK_SECRET = merchant?.razorpayWebhookSecret || "";
//       } else {
//         RAZORPAY_WEBHOOK_SECRET = merchantConfig.razorpayWebhookSecret;
//       }

//       if (!RAZORPAY_WEBHOOK_SECRET) {
//         console.log("Webhook secret not found");
//       }

//       const headersResult = RazorpayWebhookHeadersSchema.safeParse(
//         c.req.header(),
//       );
//       if (!headersResult.success) {
//         console.log("Invalid headers");

//         return respond(c, "Invalid headers", true, 200, {});
//       }

//       const {
//         "x-razorpay-signature": razorpaySignature,
//         "x-razorpay-event-id": razorpayEventId,
//       } = headersResult.data as RazorpayWebhookHeaders;

//       const isSignatureValid = validateWebhookSignature(
//         JSON.stringify(body),
//         razorpaySignature,
//         RAZORPAY_WEBHOOK_SECRET,
//       );
//       if (!isSignatureValid) {
//         console.log("Invalid signature");
//         return respond(c, "Invalid signature", true, 200, {});
//       }

//       const bodyResult = RazorpayWebhookBodySchema.safeParse(body);

//       if (!bodyResult.success) {
//         return respond(c, "Invalid body", true, 200, {});
//       }

//       //@ts-ignore
//       const { event, payload } = bodyResult.data;

//       const getOrder = await Order.findOne({
//         order_id: payload.payment.entity.order_id,
//       });
//       const tableSession = await UserSession.findOne({
//         businessId: getOrder?.businessId,
//         tableName: getOrder?.tableName,
//       });

//       const originBillIsSplit = await checkOriginBillIsSplit(tableSession);

//       if (originBillIsSplit) {
//         const splitBillTableSessionData = await SplitBillTableSession.findOne({
//           _id: getOrder?.variantId,
//         });

//         if (!splitBillTableSessionData) {
//           console.log("Split bill session not found");
//         }

//         if ((tableSession?.variantsCounts ?? 0) > 1) {
//           if (event === "payment.failed") {
//             const splitTableSessionData = await SplitBillTableSession.findOne({
//               _id: getOrder?.variantId,
//             });

//             if (!splitTableSessionData) {
//               console.log("Split table session not found");
//             }

//             const claimCoins = Number(getOrder?.claimedCoins) || 0;
//             const alertExist = await PaymentAlert.findOne({
//               order_id: getOrder?._id,
//               status: "FAIL",
//               alertType: "ONLINE",
//             });
//             if (!alertExist) {
//               await PaymentAlert.create(
//                 [
//                   {
//                     errorReason: payload.payment.entity.error_reason,
//                     errorDescription: payload.payment.entity.error_description,
//                     businessId: getOrder?.businessId,
//                     alertType: "ONLINE",
//                     order_id: getOrder?._id,
//                     userId: getOrder?.userId,
//                     status: "FAIL",
//                     tableName: getOrder?.tableName,
//                     coinsApplied:
//                       splitTableSessionData?.claimedCoins || claimCoins > 0,
//                     isAccepted: false,
//                     date: Date.now(),
//                     message: `Fail ${getOrder?.total}`,
//                     couponId: payload?.payment?.entity.notes?.couponId,
//                     mode: payload?.payment?.entity?.method,
//                   },
//                 ],
//                 { session },
//               );

//               QrBill.findOneAndUpdate(
//                 {
//                   $or: [{ billId: splitTableSessionData?._id?.toString() }],
//                 },
//                 { status: "FAILED" },
//                 { session },
//               );
//             }
//           }

//           if (event === "payment.captured") {
//             const splitTableSessionData = await SplitBillTableSession.findOne({
//               _id: getOrder?.variantId,
//             });
//             if (!splitTableSessionData) {
//               console.log("Split table session not found");
//             }

//             const paymentAlreadyExist = await Payment.findOne({
//               razorpayEventId: razorpayEventId,
//             });

//             if (!paymentAlreadyExist && getOrder) {
//               const claimCoins = Number(getOrder?.claimedCoins) || 0;
//               let getCashBack = 0;

//               if (
//                 payload?.payment?.entity?.notes?.loyaltyId &&
//                 getOrder?.userId?.toString()
//               ) {
//                 if (claimCoins > 0) {
//                   await removeCoins(
//                     claimCoins,
//                     getOrder.tableName,
//                     payload.payment.entity.notes.loyaltyId || "",
//                     getOrder?._id.toString() || "",
//                     getOrder?.userId.toString() || "",
//                     session,
//                   );
//                 }

//                 let cashBack = await calculatedCashbackCoins(
//                   getOrder?.businessId.toString(),
//                   getOrder?.billValue || 0,
//                   claimCoins,
//                   Number(getOrder.couponDiscount),
//                   Number(getOrder.discount),
//                 );

//                 if (getOrder?.cashbackAvailable === false) {
//                   cashBack = 0;
//                 }

//                 const cashBackCoins = await addCoins(
//                   cashBack,
//                   getOrder?.userId.toString() || "",
//                   getOrder?._id.toString() || "",

//                   getOrder?.tableName,
//                   getOrder?.businessId.toString() || "",
//                   payload.payment.entity.notes.loyaltyId || "",

//                   session,
//                 );

//                 getCashBack = cashBackCoins;
//               }

//               await PaymentAlert.updateOne(
//                 {
//                   tableName: getOrder?.tableName,
//                   isAccepted: false,
//                   alertType: "OFFLINE",
//                 },
//                 { isAccepted: true, isRejected: true },
//                 { session },
//               );

//               const createPayment = await Payment.create(
//                 [
//                   {
//                     businessId: getOrder?.businessId,
//                     total: getOrder?.total,
//                     billValue: getOrder?.billValue,
//                     mode: payload.payment.entity.method,
//                     userId: getOrder?.userId,
//                     order_id: getOrder?._id,
//                     paymentMode: "online",
//                     tableName: getOrder?.tableName,
//                     claimedCoins: getOrder?.claimedCoins,
//                     tips: getOrder?.tips,
//                     razorpayPaymentId: payload.payment.entity.id,
//                     razorpayOrderId: payload.payment.entity.order_id,
//                     razorpayAcquirerData: payload.payment.entity.acquirer_data,
//                     razorpayEventId: razorpayEventId,
//                     couponId: getOrder?.couponId,
//                     channelId: getOrder?.channelId,
//                     earnCoins: getCashBack,
//                     date: Date.now(),
//                     tax: splitBillTableSessionData?.gst,
//                     serviceCharge: splitBillTableSessionData?.serviceCharge,
//                     billId: splitBillTableSessionData?._id.toString(),
//                     settleType:
//                       splitBillTableSessionData?.settleType ||
//                       "PAYMENT_GATEWAY",
//                     discount: splitBillTableSessionData?.discount,
//                     couponDiscount: splitBillTableSessionData?.couponDiscount,
//                     billItems: splitBillTableSessionData?.items || [],
//                     isSplitBillVariant: true,
//                   },
//                 ],
//                 { session },
//               );

//               await PaymentAlert.create(
//                 [
//                   {
//                     businessId: getOrder?.businessId,
//                     alertType: "ONLINE",
//                     payment_id: createPayment[0]._id,
//                     coinsApplied: claimCoins > 0,
//                     status: "SUCCESS",
//                     order_id: getOrder?._id,
//                     message: `Paid ${getOrder?.total}`,
//                     tableName: `T-${getOrder?.tableName?.slice(-2)}`,
//                     isAccepted: false,
//                     userId: getOrder?.userId,
//                     date: Date.now(),
//                     mode: payload.payment.entity.method,
//                   },
//                 ],
//                 { session },
//               );

//               await SplitBillTableSession.findOneAndUpdate(
//                 { _id: getOrder?.variantId },
//                 {
//                   $set: {
//                     isPaid: true,
//                   },
//                 },
//                 { session },
//               );
//               await UserSession.findOneAndUpdate(
//                 {
//                   tableName: getOrder?.tableName,
//                   businessId: getOrder?.businessId,
//                 },
//                 {
//                   $inc: {
//                     variantsCounts: -1,
//                   },
//                 },
//                 { session },
//               );

//               await QrBill.findOneAndUpdate(
//                 {
//                   $or: [{ billId: splitTableSessionData?._id?.toString() }],
//                 },
//                 { status: "SUCCESS" },
//                 { session },
//               );
//             }
//           }

//           return respond(
//             c,
//             "Payment processed successfully for split bill",
//             false,
//             200,
//             {},
//           );
//         }

//         if ((tableSession?.variantsCounts ?? 0) === 1) {
//           if (event === "payment.failed") {
//             const splitTableSessionData = await SplitBillTableSession.findOne({
//               _id: getOrder?.variantId,
//             });

//             if (!splitTableSessionData) {
//               console.log("Split table session not found");
//             }

//             const claimCoins = Number(getOrder?.claimedCoins) || 0;
//             const alertExist = await PaymentAlert.findOne({
//               order_id: getOrder?._id,
//               status: "FAIL",
//               alertType: "ONLINE",
//             });
//             if (!alertExist) {
//               await PaymentAlert.create(
//                 [
//                   {
//                     errorReason: payload.payment.entity.error_reason,
//                     errorDescription: payload.payment.entity.error_description,
//                     businessId: getOrder?.businessId,
//                     alertType: "ONLINE",
//                     order_id: getOrder?._id,
//                     userId: getOrder?.userId,
//                     status: "FAIL",
//                     tableName: getOrder?.tableName,
//                     coinsApplied:
//                       splitTableSessionData?.claimedCoins || claimCoins > 0,
//                     isAccepted: false,
//                     date: Date.now(),
//                     message: `Fail ${getOrder?.total}`,
//                     couponId: payload?.payment?.entity.notes?.couponId,
//                     mode: payload?.payment?.entity?.method,
//                   },
//                 ],
//                 { session },
//               );

//               QrBill.findOneAndUpdate(
//                 {
//                   $or: [{ billId: splitTableSessionData?._id?.toString() }],
//                 },
//                 { status: "FAILED" },
//                 { session },
//               );
//             }
//           }

//           if (event === "payment.captured") {
//             const splitTableSessionData = await SplitBillTableSession.findOne({
//               _id: getOrder?.variantId,
//             });
//             if (!splitTableSessionData) {
//               console.log("Split table session not found");
//             }

//             const paymentAlreadyExist = await Payment.findOne({
//               razorpayEventId: razorpayEventId,
//             });

//             if (!paymentAlreadyExist && getOrder) {
//               const pos = await BusinessPosConfig.findOne({
//                 businessId: getOrder?.businessId,
//                 isDeleted: false,
//                 active: true,
//               });
//               const claimCoins = Number(getOrder?.claimedCoins) || 0;
//               let getCashBack = 0;

//               if (
//                 payload?.payment?.entity?.notes?.loyaltyId &&
//                 getOrder?.userId?.toString()
//               ) {
//                 if (claimCoins > 0) {
//                   await removeCoins(
//                     claimCoins,
//                     getOrder.tableName,
//                     payload.payment.entity.notes.loyaltyId || "",
//                     getOrder?._id.toString() || "",
//                     getOrder?.userId.toString() || "",
//                     session,
//                   );
//                 }

//                 let cashBack = await calculatedCashbackCoins(
//                   getOrder?.businessId.toString(),
//                   getOrder?.billValue || 0,
//                   claimCoins,
//                   Number(getOrder.couponDiscount),
//                   Number(getOrder.discount),
//                 );

//                 if (getOrder?.cashbackAvailable === false) {
//                   cashBack = 0;
//                 }

//                 const cashBackCoins = await addCoins(
//                   cashBack,
//                   getOrder?.userId.toString() || "",
//                   getOrder?._id.toString() || "",

//                   getOrder?.tableName,
//                   getOrder?.businessId.toString() || "",
//                   payload.payment.entity.notes.loyaltyId || "",

//                   session,
//                 );

//                 getCashBack = cashBackCoins;
//               }
//               await PaymentAlert.updateOne(
//                 {
//                   tableName: getOrder?.tableName,
//                   businessId: getOrder?.businessId,
//                   isAccepted: false,
//                   alertType: "OFFLINE",
//                 },
//                 { isAccepted: true, isRejected: true },
//                 { session },
//               );

//               const createPayment = await Payment.create(
//                 [
//                   {
//                     businessId: getOrder?.businessId,
//                     total: getOrder?.total,
//                     billValue: getOrder?.billValue,
//                     mode: payload.payment.entity.method,
//                     userId: getOrder?.userId,
//                     order_id: getOrder?._id,
//                     paymentMode: "online",
//                     tableName: getOrder?.tableName,
//                     claimedCoins: getOrder?.claimedCoins,
//                     tips: getOrder?.tips,
//                     razorpayPaymentId: payload.payment.entity.id,
//                     razorpayOrderId: payload.payment.entity.order_id,
//                     razorpayAcquirerData: payload.payment.entity.acquirer_data,
//                     razorpayEventId: razorpayEventId,
//                     couponId: getOrder?.couponId,
//                     channelId: getOrder?.channelId,
//                     earnCoins: getCashBack,
//                     date: Date.now(),
//                     tax: splitBillTableSessionData?.gst,
//                     serviceCharge: splitBillTableSessionData?.serviceCharge,
//                     billId: splitBillTableSessionData?._id.toString(),
//                     settleType:
//                       splitBillTableSessionData?.settleType ||
//                       "PAYMENT_GATEWAY",
//                     discount: splitBillTableSessionData?.discount,
//                     couponDiscount: splitBillTableSessionData?.couponDiscount,
//                     billItems: splitBillTableSessionData?.items || [],
//                     isSplitBillVariant: true,
//                   },
//                 ],
//                 { session },
//               );

//               await PaymentAlert.create(
//                 [
//                   {
//                     businessId: getOrder?.businessId,
//                     alertType: "ONLINE",
//                     payment_id: createPayment[0]._id,
//                     coinsApplied: claimCoins > 0,
//                     status: "SUCCESS",
//                     order_id: getOrder?._id,
//                     message: `Paid ${getOrder?.total}`,
//                     tableName: `T-${getOrder?.tableName?.slice(-2)}`,
//                     isAccepted: false,
//                     userId: getOrder?.userId,
//                     date: Date.now(),
//                     mode: payload.payment.entity.method,
//                   },
//                 ],
//                 { session },
//               );

//               await SplitBillTableSession.findOneAndUpdate(
//                 { _id: getOrder?.variantId },
//                 {
//                   $set: {
//                     isPaid: true,
//                   },
//                 },
//                 { session },
//               );
//               await UserSession.findOneAndUpdate(
//                 {
//                   tableName: getOrder?.tableName,
//                   businessId: getOrder?.businessId,
//                 },
//                 {
//                   $inc: {
//                     variantsCounts: -1,
//                   },
//                 },
//                 { session },
//               );

//               await QrBill.findOneAndUpdate(
//                 {
//                   $or: [{ billId: splitTableSessionData?._id?.toString() }],
//                 },
//                 { status: "SUCCESS" },
//                 { session },
//               );
//             }
//           }
//         }

//         if ((tableSession?.variantsCounts ?? 0) === 1) {
//           if (event === "payment.captured") {
//             const paymentAlreadyExist = await Payment.findOne({
//               razorpayEventId: razorpayEventId,
//             });

//             if (!paymentAlreadyExist && getOrder) {
//               const pos = await BusinessPosConfig.findOne({
//                 businessId: getOrder?.businessId,
//                 isDeleted: false,
//                 active: true,
//               });

//               if (pos) {
//                 const pay = {
//                   app_key: pos.accessKey,
//                   app_secret: pos.secretKey,
//                   access_token: pos.authToken,
//                   restID: pos.restId,
//                   pin: tableSession?.pin,
//                   tableNo: getOrder.tableName,
//                 };
//                 setTimeout(() => {
//                   (async () => {
//                     try {
//                       // 1. Request the bill
//                       const {
//                         data: { bill_request_id },
//                       } = await axios.post(posApiPaths.requestBill, pay, {
//                         headers: { "Content-Type": "application/json" },
//                       });
//                     } catch (err) {
//                       console.error("Failed to request/settle bill:", err);
//                     }
//                   })();
//                 }, 10000);

//                 setTimeout(() => {
//                   (async () => {
//                     try {
//                       // 1. Request the bill
//                       const {
//                         data: { bill_request_id },
//                       } = await axios.post(posApiPaths.requestBill, pay, {
//                         headers: { "Content-Type": "application/json" },
//                       });

//                       // 2. Settle the table
//                       const { data: settleData } = await axios.post(
//                         posApiPaths.settleTable,
//                         {
//                           app_key: pos.accessKey,
//                           app_secret: pos.secretKey,
//                           access_token: pos.authToken,
//                           restID: pos.restId,
//                           bill_request_id,
//                           amount_paid: tableSession?.total,
//                           pin: tableSession?.pin,
//                         },
//                       );

//                       // 3. If settlement failed (success === "0"), upsert into UnsettleTable
//                       if (settleData.success === "0") {
//                         await UnsettleTable.findOneAndUpdate(
//                           {
//                             businessId: getOrder.businessId,
//                             tableName: getOrder.tableName,
//                             pin: tableSession?.pin,
//                           },
//                           {
//                             sync: false,
//                             // <-- use settleData.request_id, not response.data.request_id
//                             requestId: settleData.request_id,
//                             pin: tableSession?.pin,
//                             restId: pos.restId,
//                             date: Date.now(),
//                             total: tableSession?.total,
//                           },
//                           { new: true, upsert: true },
//                         );
//                       }
//                       const unsettleTable = await UnsettleTable.find({
//                         businessId: getOrder.businessId,
//                         restId: pos.restId,
//                         sync: false,
//                       });

//                       for (const table of unsettleTable) {
//                         const payload = {
//                           app_key: pos.accessKey,
//                           app_secret: pos.secretKey,
//                           access_token: pos.authToken,
//                           restID: pos.restId,
//                           pin: table?.pin,
//                           tableNo: table?.tableName,
//                         };

//                         await axios.post(posApiPaths.requestBill, payload, {
//                           headers: {
//                             "Content-Type": "application/json",
//                           },
//                         });
//                       }
//                     } catch (err) {
//                       console.error("Failed to request/settle bill:", err);
//                     }
//                   })();
//                 }, 35000);

//                 await UserSession.deleteOne(
//                   {
//                     tableName: getOrder.tableName,
//                     businessId: getOrder.businessId,
//                   },
//                   {
//                     session,
//                   },
//                 );

//                 await KotOrder.updateMany(
//                   {
//                     tableName: getOrder.tableName,
//                     businessId: getOrder.businessId,

//                     settled: false,
//                   },
//                   {
//                     $set: {
//                       settled: true,
//                     },
//                   },
//                   {
//                     session,
//                   },
//                 );

//                 await Table.findOneAndUpdate(
//                   {
//                     businessId: getOrder.businessId,
//                     name: getOrder.tableName,
//                   },
//                   {
//                     $set: {
//                       status: "EMPTY",
//                       currentTableAmount: 0,
//                       userIds: [],
//                       totalItemCount: 0,
//                       capacity: 0,
//                       hiCode: "",
//                       isTransfer: false,
//                     },
//                   },
//                   {
//                     session,
//                   },
//                 );
//               }
//             }
//           }
//         }

//         return respond(
//           c,
//           "Payment processed successfully for split bill",
//           false,
//           200,
//           {},
//         );
//       }

//       if (event === "payment.failed") {
//         const claimCoins = Number(getOrder?.claimedCoins) || 0;
//         const alertExist = await PaymentAlert.findOne({
//           order_id: getOrder?._id,
//           status: "FAIL",
//           alertType: "ONLINE",
//         });
//         if (!alertExist) {
//           await PaymentAlert.create(
//             [
//               {
//                 errorReason: payload.payment.entity.error_reason,
//                 errorDescription: payload.payment.entity.error_description,
//                 businessId: getOrder?.businessId,
//                 alertType: "ONLINE",
//                 order_id: getOrder?._id,
//                 userId: getOrder?.userId,
//                 status: "FAIL",
//                 tableName: getOrder?.tableName,
//                 coinsApplied: tableSession?.claimedCoins || claimCoins > 0,
//                 isAccepted: false,
//                 date: Date.now(),
//                 message: `Fail ${getOrder?.total}`,
//                 couponId: payload?.payment?.entity.notes?.couponId,
//                 mode: payload?.payment?.entity?.method,
//               },
//             ],
//             { session },
//           );

//           QrBill.findOneAndUpdate(
//             { billId: tableSession?._id.toString() },
//             { status: "FAILED" },
//             { session },
//           );
//         }
//       }

//       if (event === "payment.captured") {
//         const paymentAlreadyExist = await Payment.findOne({
//           razorpayEventId: razorpayEventId,
//         });

//         if (!paymentAlreadyExist && getOrder) {
//           const pos = await BusinessPosConfig.findOne({
//             businessId: getOrder?.businessId,
//             isDeleted: false,
//             active: true,
//           });
//           const claimCoins = Number(getOrder?.claimedCoins) || 0;
//           await PaymentAlert.updateOne(
//             {
//               tableName: getOrder?.tableName,
//               businessId: getOrder?.businessId,
//               isAccepted: false,
//               alertType: "OFFLINE",
//             },
//             { isAccepted: true, isRejected: true },
//             { session },
//           );

//           let getCashBack = 0;

//           if (
//             payload?.payment?.entity?.notes?.loyaltyId &&
//             getOrder?.userId?.toString()
//           ) {
//             if (claimCoins > 0) {
//               await removeCoins(
//                 claimCoins,
//                 getOrder.tableName,
//                 payload.payment.entity.notes.loyaltyId || "",
//                 getOrder?._id.toString() || "",
//                 getOrder?.userId.toString() || "",
//                 session,
//               );
//             }

//             let cashBack = await calculatedCashbackCoins(
//               getOrder?.businessId.toString(),
//               getOrder?.billValue || 0,
//               claimCoins,
//               Number(getOrder.couponDiscount),
//               Number(getOrder.discount),
//             );

//             if (getOrder?.cashbackAvailable === false) {
//               cashBack = 0;
//             }

//             const cashBackCoins = await addCoins(
//               cashBack,
//               getOrder?.userId.toString() || "",
//               getOrder?._id.toString() || "",

//               getOrder?.tableName,
//               getOrder?.businessId.toString() || "",
//               payload.payment.entity.notes.loyaltyId || "",

//               session,
//             );

//             getCashBack = cashBackCoins;
//           }

//           const createPayment = await Payment.create(
//             [
//               {
//                 businessId: getOrder?.businessId,
//                 total: getOrder?.total,
//                 billValue: getOrder?.billValue,
//                 mode: payload.payment.entity.method,
//                 userId: getOrder?.userId,
//                 order_id: getOrder?._id,
//                 paymentMode: "online",
//                 tableName: getOrder?.tableName,
//                 claimedCoins: getOrder?.claimedCoins,
//                 tips: getOrder?.tips,
//                 razorpayPaymentId: payload.payment.entity.id || nanoid(15),
//                 razorpayOrderId: payload.payment.entity.order_id,
//                 razorpayAcquirerData: payload.payment.entity.acquirer_data,
//                 razorpayEventId: razorpayEventId,
//                 couponId: getOrder?.couponId || null,
//                 channelId: getOrder?.channelId || null,
//                 earnCoins: getCashBack,
//                 date: Date.now(),
//                 tax: tableSession?.gst,
//                 serviceCharge: tableSession?.serviceCharge,
//                 billId: tableSession?._id.toString(),
//                 settleType: tableSession?.settleType || "PAYMENT_GATEWAY",
//                 discount: tableSession?.discount,
//                 couponDiscount: tableSession?.couponDiscount,
//                 billItems: tableSession?.items || [],
//               },
//             ],
//             { session },
//           );

//           await PaymentAlert.create(
//             [
//               {
//                 businessId: getOrder?.businessId,
//                 alertType: "ONLINE",
//                 payment_id: createPayment[0]._id,
//                 coinsApplied: claimCoins > 0,
//                 status: "SUCCESS",
//                 order_id: getOrder?._id,
//                 message: `Paid ${getOrder?.total}`,
//                 tableName: `${getOrder?.tableName?.slice(-2)}`,
//                 isAccepted: false,
//                 userId: getOrder?.userId,
//                 date: Date.now(),
//                 mode: payload.payment.entity.method,
//               },
//             ],
//             { session },
//           );

//           if (pos) {
//             const pay = {
//               app_key: pos.accessKey,
//               app_secret: pos.secretKey,
//               access_token: pos.authToken,
//               restID: pos.restId,
//               pin: tableSession?.pin,
//               tableNo: getOrder.tableName,
//             };
//             setTimeout(() => {
//               (async () => {
//                 try {
//                   // 1. Request the bill
//                   const {
//                     data: { bill_request_id },
//                   } = await axios.post(posApiPaths.requestBill, pay, {
//                     headers: { "Content-Type": "application/json" },
//                   });
//                 } catch (err) {
//                   console.error("Failed to request/settle bill:", err);
//                 }
//               })();
//             }, 10000);

//             setTimeout(() => {
//               (async () => {
//                 try {
//                   // 1. Request the bill
//                   const {
//                     data: { bill_request_id },
//                   } = await axios.post(posApiPaths.requestBill, pay, {
//                     headers: { "Content-Type": "application/json" },
//                   });

//                   // 2. Settle the table
//                   const { data: settleData } = await axios.post(
//                     posApiPaths.settleTable,
//                     {
//                       app_key: pos.accessKey,
//                       app_secret: pos.secretKey,
//                       access_token: pos.authToken,
//                       restID: pos.restId,
//                       bill_request_id,
//                       amount_paid: getOrder.total,
//                       pin: tableSession?.pin,
//                     },
//                   );

//                   // 3. If settlement failed (success === "0"), upsert into UnsettleTable
//                   if (settleData.success === "0") {
//                     await UnsettleTable.findOneAndUpdate(
//                       {
//                         businessId: getOrder.businessId,
//                         tableName: getOrder.tableName,
//                         pin: tableSession?.pin,
//                       },
//                       {
//                         sync: false,
//                         // <-- use settleData.request_id, not response.data.request_id
//                         requestId: settleData.request_id,
//                         pin: tableSession?.pin,
//                         restId: pos.restId,
//                         date: Date.now(),
//                         total: getOrder.total,
//                       },
//                       { new: true, upsert: true },
//                     );
//                   }
//                   const unsettleTable = await UnsettleTable.find({
//                     businessId: getOrder.businessId,
//                     restId: pos.restId,
//                     sync: false,
//                   });

//                   for (const table of unsettleTable) {
//                     const payload = {
//                       app_key: pos.accessKey,
//                       app_secret: pos.secretKey,
//                       access_token: pos.authToken,
//                       restID: pos.restId,
//                       pin: table?.pin,
//                       tableNo: table?.tableName,
//                     };

//                     await axios.post(posApiPaths.requestBill, payload, {
//                       headers: {
//                         "Content-Type": "application/json",
//                       },
//                     });
//                   }
//                 } catch (err) {
//                   console.error("Failed to request/settle bill:", err);
//                 }
//               })();
//             }, 35000);

//             await QrBill.findOneAndUpdate(
//               {
//                 billId: tableSession?._id.toString(),
//               },
//               {
//                 $set: {
//                   status: "SUCCESS",
//                 },
//               },
//               {
//                 session,
//               },
//             );

//             await UserSession.deleteOne(
//               {
//                 tableName: getOrder.tableName,
//                 businessId: getOrder.businessId,
//               },
//               {
//                 session,
//               },
//             );

//             await KotOrder.updateMany(
//               {
//                 tableName: getOrder.tableName,
//                 businessId: getOrder.businessId,

//                 settled: false,
//               },
//               {
//                 $set: {
//                   settled: true,
//                 },
//               },
//               {
//                 session,
//               },
//             );

//             await Table.findOneAndUpdate(
//               {
//                 businessId: getOrder.businessId,
//                 name: getOrder.tableName,
//               },
//               {
//                 $set: {
//                   status: "EMPTY",
//                   currentTableAmount: 0,
//                   userIds: [],
//                   totalItemCount: 0,
//                   capacity: 0,
//                   hiCode: "",
//                   isTransfer: false,
//                 },
//               },
//               {
//                 session,
//               },
//             );
//           }
//         }
//       }

//       return respond(c, "Webhook received successfully", false, 200, {});
//     });
//   })

//   .post("/razorpay-webhook/2/:merchantId", async (c) => {
//     //@ts-ignore
//     return runInTransaction(async (session: ClientSession) => {
//       const { merchantId } = c.req.param();
//       const merchantConfig = (await getMerchantConfig(
//         merchantId,
//       )) as MerchantConfig;

//       let RAZORPAY_WEBHOOK_SECRET = "";
//       const body = await c.req.json();
//       if (!merchantConfig) {
//         const merchant = await BusinessSettings.findOne({
//           razorpayMerchantId: merchantId,
//         }).select("razorpayWebhookSecret");
//         RAZORPAY_WEBHOOK_SECRET = merchant?.razorpayWebhookSecret || "";
//       } else {
//         RAZORPAY_WEBHOOK_SECRET = merchantConfig.razorpayWebhookSecret;
//       }

//       if (!RAZORPAY_WEBHOOK_SECRET) {
//         console.log("razorpay_webhook_secret missing");
//       }

//       const headersResult = RazorpayWebhookHeadersSchema.safeParse(
//         c.req.header(),
//       );
//       if (!headersResult.success) {
//         console.log("Invalid headers");
//         return respond(c, "Invalid headers", true, 200, {});
//       }

//       const {
//         "x-razorpay-signature": razorpaySignature,
//         "x-razorpay-event-id": razorpayEventId,
//       } = headersResult.data as RazorpayWebhookHeaders;

//       const isSignatureValid = validateWebhookSignature(
//         JSON.stringify(body),
//         razorpaySignature,
//         RAZORPAY_WEBHOOK_SECRET,
//       );
//       if (!isSignatureValid) {
//         console.log("Invalid signature");
//         return respond(c, "Invalid signature", true, 200, {});
//       }

//       const bodyResult = RazorpayWebhookBodySchema.safeParse(body);

//       if (!bodyResult.success) {
//         console.log("Invalid body", bodyResult);

//         return respond(c, "Invalid body", true, 200, {});
//       }
//       //@ts-ignore
//       const { event, payload } = bodyResult.data;

//       const getOrder = await Order.findOne({
//         order_id: payload.payment.entity.order_id,
//       });

//       if (event === "payment.captured") {
//         const paymentAlreadyExist = await Payment.findOne({
//           razorpayEventId: razorpayEventId,
//         });

//         if (!paymentAlreadyExist && getOrder) {
//           const claimCoins = Number(getOrder?.claimedCoins) || 0;

//           if (payload.payment.entity.notes.loyaltyId) {
//             const existingUser = (await UserReward.findOne({
//               userId: getOrder.userId,
//               loyaltyId: payload.payment.entity.notes.loyaltyId,
//             }).select("rewards")) || { rewards: 0 };

//             const existingLoyalty = await LoyaltySettings.findOne({
//               businessId: getOrder.businessId,
//               isActive: true,
//             }).select("rewardLimit");

//             const coinsCalculated = await calculateReward(
//               existingUser.rewards,
//               claimCoins,
//               existingLoyalty?.rewardLimit as number,
//               session,
//             );

//             const userGrabbed = await UserCouponGrabb.findOne({
//               userId: getOrder.userId,
//               businessId: getOrder.businessId,
//               isDeleted: false,
//             }).count();

//             const userById = await User.findById(getOrder.userId);

//             const userTags = await UserTags.find({
//               userId: getOrder.userId,
//               businessId: getOrder.businessId,
//             });
//             let tagIds = [];
//             for (const tag of userTags) {
//               tagIds.push(tag.tagId);
//             }

//             const userAnalytics = await UserAnalytic.findOne({
//               userId: getOrder?.userId,
//               businessId: getOrder?.businessId,
//             }).select("totalSpend visitCount");
//             if (userAnalytics) {
//               const countAvgSpend = Math.round(
//                 userAnalytics.totalSpend / userAnalytics.visitCount,
//               );
//               await UserAnalytic.findOneAndUpdate(
//                 { userId: getOrder?.userId, businessId: getOrder?.businessId },
//                 {
//                   $inc: {
//                     totalSpend: getOrder.total,
//                     visitCount: 1,
//                     coinzIssued: coinsCalculated.finalReward,
//                     coinzUsed: claimCoins,
//                   },
//                   $set: {
//                     avgSpend: countAvgSpend,
//                     tableName: getOrder?.tableName,
//                     couponCount: userGrabbed,
//                     currentCoins: coinsCalculated.finalReward,
//                     tagIds: tagIds,
//                     dob: userById?.dob,
//                   },
//                 },
//                 { session },
//               );
//             } else {
//               await UserAnalytic.create(
//                 [
//                   {
//                     userId: getOrder?.userId,
//                     businessId: getOrder?.businessId,
//                     visitCount: 1,
//                     totalSpend: getOrder.total,
//                     avgSpend: getOrder.total,
//                     dateOfJoining: Date.now(),
//                     coinzIssued: coinsCalculated.finalReward,
//                     coinzUsed: claimCoins,
//                     tableName: getOrder?.tableName,
//                     couponCount: userGrabbed,
//                     currentCoins: coinsCalculated.finalReward,
//                     tagIds: tagIds,
//                     dob: userById?.dob,
//                   },
//                 ],
//                 { session },
//               );
//             }
//           }
//         }
//       }

//       return respond(c, "2 Webhook received successfully", false, 200, {});
//     });
//   });

export default orderRouter;
