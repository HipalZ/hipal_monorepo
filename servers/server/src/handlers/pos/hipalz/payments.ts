import {
  BusinessPosConfig,
  BusinessSettings,
  KotOrder,
  MergeTable,
  Order,
  Payment,
  PaymentAlert,
  QrBill,
  SplitBillTableSession,
  Table,
  UserSession,
} from "@hi/db-models";
import type { RazorpayWebhookHeaders } from "@hi/db-models/src/validators";
import {
  RazorpayWebhookBodySchema,
  RazorpayWebhookHeadersSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import {
  addCoins,
  calculatedCashbackCoins,
  removeCoins,
} from "../../../routes/payments";
import { checkOriginBillIsSplit } from "../../../services/splitBill";
import { getMerchantConfig } from "../../../utils/cacheHelper";
import type { MerchantConfig } from "../../../utils/razorpay-wrapper";

async function hipalzPosRazorpayWebhookHandler(payload: {
  merchantId: string;

  body: unknown;
  headers: Record<string, string>;
}) {
  try {
    const { merchantId, body, headers } = payload;
    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const merchantConfig = (await getMerchantConfig(
        merchantId,
      )) as MerchantConfig | null;

      let RAZORPAY_WEBHOOK_SECRET = "";

      if (!merchantConfig) {
        const merchant = await BusinessSettings.findOne({
          razorpayMerchantId: merchantId,
        }).select("razorpayWebhookSecret");
        RAZORPAY_WEBHOOK_SECRET = merchant?.razorpayWebhookSecret || "";
      } else {
        RAZORPAY_WEBHOOK_SECRET = merchantConfig.razorpayWebhookSecret;
      }

      console.log("step_1", RAZORPAY_WEBHOOK_SECRET);

      if (!RAZORPAY_WEBHOOK_SECRET) {
        console.log("Webhook secret not found");
      }

      const headersResult = RazorpayWebhookHeadersSchema.safeParse(headers);
      if (!headersResult.success) {
        console.log("Invalid headers");

        return true;
      }

      console.log("step_2", headersResult);

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
        return true;
      }
      console.log("step_3", isSignatureValid);

      const bodyResult = RazorpayWebhookBodySchema.safeParse(body);

      if (!bodyResult.success) {
        return true;
      }
      console.log("step_4", bodyResult);

      //@ts-ignore
      const { event, payload } = bodyResult.data;

      const getOrder = await Order.findOne({
        order_id: payload.payment.entity.order_id,
      });
      const tInfo = await Table.findOne({
        businessId: getOrder?.businessId,
        name: getOrder?.tableName,
      });
      const isTableMerge = await MergeTable.findOne({
        businessId: getOrder?.businessId,
        childTableIds: tInfo?._id?.toString(),
      }).populate("parentTableId");

      const tableSession = await UserSession.findOne({
        businessId: getOrder?.businessId,
        tableName: isTableMerge?.parentTableId?.name || getOrder?.tableName,
      });
      console.log("step_5");
      //@ts-ignore
      const originBillIsSplit = await checkOriginBillIsSplit(tableSession);
      console.log("originBillIsSplit", originBillIsSplit);

      if (originBillIsSplit) {
        const splitBillTableSessionData = await SplitBillTableSession.findOne({
          _id: getOrder?.variantId,
        });

        if (!splitBillTableSessionData) {
          console.log("Split bill session not found");
        }

        if ((tableSession?.variantsCounts ?? 0) > 1) {
          if (event === "payment.failed") {
            const splitTableSessionData = await SplitBillTableSession.findOne({
              _id: getOrder?.variantId,
            });

            if (!splitTableSessionData) {
              console.log("Split table session not found");
            }

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
                    tableName:
                      isTableMerge?.parentTableId?.name || getOrder?.tableName,
                    coinsApplied:
                      splitTableSessionData?.claimedCoins || claimCoins > 0,
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
                {
                  $or: [{ billId: splitTableSessionData?._id?.toString() }],
                },
                { status: "FAILED" },
                { session },
              );
            }
          }

          if (event === "payment.captured") {
            const splitTableSessionData = await SplitBillTableSession.findOne({
              _id: getOrder?.variantId,
            });
            if (!splitTableSessionData) {
              console.log("Split table session not found");
            }

            const paymentAlreadyExist = await Payment.findOne({
              razorpayEventId: razorpayEventId,
            });

            if (!paymentAlreadyExist && getOrder) {
              const claimCoins = Number(getOrder?.claimedCoins) || 0;
              let getCashBack = 0;

              if (
                payload?.payment?.entity?.notes?.loyaltyId &&
                getOrder?.userId?.toString()
              ) {
                if (claimCoins > 0) {
                  await removeCoins(
                    claimCoins,
                    isTableMerge?.parentTableId?.name || getOrder?.tableName,
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
                  Number(getOrder.couponDiscount),
                  Number(getOrder.discount),
                );

                if (getOrder?.cashbackAvailable === false) {
                  cashBack = 0;
                }

                const cashBackCoins = await addCoins(
                  cashBack,
                  getOrder?.userId.toString() || "",
                  getOrder?._id.toString() || "",

                  isTableMerge?.parentTableId?.name || getOrder?.tableName,
                  getOrder?.businessId.toString() || "",
                  payload.payment.entity.notes.loyaltyId || "",

                  session,
                );

                getCashBack = cashBackCoins;
              }

              await PaymentAlert.updateOne(
                {
                  tableName:
                    isTableMerge?.parentTableId?.name || getOrder?.tableName,
                  isAccepted: false,
                  alertType: "OFFLINE",
                },
                { isAccepted: true, isRejected: true },
                { session },
              );

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
                    tableName:
                      isTableMerge?.parentTableId?.name || getOrder?.tableName,
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
                    tax: splitBillTableSessionData?.gst,
                    serviceCharge: splitBillTableSessionData?.serviceCharge,
                    billId: splitBillTableSessionData?._id.toString(),
                    settleType:
                      splitBillTableSessionData?.settleType ||
                      "PAYMENT_GATEWAY",
                    discount: splitBillTableSessionData?.discount,
                    couponDiscount: splitBillTableSessionData?.couponDiscount,
                    billItems: splitBillTableSessionData?.items || [],
                    isSplitBillVariant: true,
                    billInvoice: splitBillTableSessionData?.billInvoice,
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
                    tableName: `${
                      isTableMerge?.parentTableId?.name || getOrder?.tableName
                    }`,
                    isAccepted: false,
                    userId: getOrder?.userId,
                    date: Date.now(),
                    mode: payload.payment.entity.method,
                  },
                ],
                { session },
              );

              await SplitBillTableSession.findOneAndUpdate(
                { _id: getOrder?.variantId },
                {
                  $set: {
                    isPaid: true,
                  },
                },
                { session },
              );
              await UserSession.findOneAndUpdate(
                {
                  tableName:
                    isTableMerge?.parentTableId?.name || getOrder?.tableName,
                  businessId: getOrder?.businessId,
                },
                {
                  $inc: {
                    variantsCounts: -1,
                  },
                },
                { session },
              );

              await QrBill.findOneAndUpdate(
                {
                  $or: [{ billId: splitTableSessionData?._id?.toString() }],
                },
                { status: "SUCCESS" },
                { session },
              );
            }
          }

          return true;
        }

        if ((tableSession?.variantsCounts ?? 0) === 1) {
          if (event === "payment.failed") {
            const splitTableSessionData = await SplitBillTableSession.findOne({
              _id: getOrder?.variantId,
            });

            if (!splitTableSessionData) {
              console.log("Split table session not found");
            }

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
                    tableName:
                      isTableMerge?.parentTableId?.name || getOrder?.tableName,
                    coinsApplied:
                      splitTableSessionData?.claimedCoins || claimCoins > 0,
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
                {
                  $or: [{ billId: splitTableSessionData?._id?.toString() }],
                },
                { status: "FAILED" },
                { session },
              );
            }
          }

          if (event === "payment.captured") {
            const splitTableSessionData = await SplitBillTableSession.findOne({
              _id: getOrder?.variantId,
            });
            if (!splitTableSessionData) {
              console.log("Split table session not found");
            }

            const paymentAlreadyExist = await Payment.findOne({
              razorpayEventId: razorpayEventId,
            });

            if (!paymentAlreadyExist && getOrder) {
              const pos = await BusinessPosConfig.findOne({
                businessId: getOrder?.businessId,
                isDeleted: false,
                active: true,
              });
              const claimCoins = Number(getOrder?.claimedCoins) || 0;
              let getCashBack = 0;

              if (
                payload?.payment?.entity?.notes?.loyaltyId &&
                getOrder?.userId?.toString()
              ) {
                if (claimCoins > 0) {
                  await removeCoins(
                    claimCoins,
                    isTableMerge?.parentTableId?.name || getOrder?.tableName,
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
                  Number(getOrder.couponDiscount),
                  Number(getOrder.discount),
                );

                if (getOrder?.cashbackAvailable === false) {
                  cashBack = 0;
                }

                const cashBackCoins = await addCoins(
                  cashBack,
                  getOrder?.userId.toString() || "",
                  getOrder?._id.toString() || "",

                  isTableMerge?.parentTableId?.name || getOrder?.tableName,
                  getOrder?.businessId.toString() || "",
                  payload.payment.entity.notes.loyaltyId || "",

                  session,
                );

                getCashBack = cashBackCoins;
              }
              await PaymentAlert.updateOne(
                {
                  tableName:
                    isTableMerge?.parentTableId?.name || getOrder?.tableName,
                  businessId: getOrder?.businessId,
                  isAccepted: false,
                  alertType: "OFFLINE",
                },
                { isAccepted: true, isRejected: true },
                { session },
              );

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
                    tableName:
                      isTableMerge?.parentTableId?.name || getOrder?.tableName,
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
                    tax: splitBillTableSessionData?.gst,
                    serviceCharge: splitBillTableSessionData?.serviceCharge,
                    billId: splitBillTableSessionData?._id.toString(),
                    settleType:
                      splitBillTableSessionData?.settleType ||
                      "PAYMENT_GATEWAY",
                    discount: splitBillTableSessionData?.discount,
                    couponDiscount: splitBillTableSessionData?.couponDiscount,
                    billItems: splitBillTableSessionData?.items || [],
                    isSplitBillVariant: true,
                    billInvoice: splitBillTableSessionData?.billInvoice,
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
                    tableName: `${
                      isTableMerge?.parentTableId?.name || getOrder?.tableName
                    }`,
                    isAccepted: false,
                    userId: getOrder?.userId,
                    date: Date.now(),
                    mode: payload.payment.entity.method,
                  },
                ],
                { session },
              );

              await SplitBillTableSession.findOneAndUpdate(
                { _id: getOrder?.variantId },
                {
                  $set: {
                    isPaid: true,
                  },
                },
                { session },
              );
              await UserSession.findOneAndUpdate(
                {
                  tableName:
                    isTableMerge?.parentTableId?.name || getOrder?.tableName,
                  businessId: getOrder?.businessId,
                },
                {
                  $inc: {
                    variantsCounts: -1,
                  },
                },
                { session },
              );

              await QrBill.findOneAndUpdate(
                {
                  $or: [{ billId: splitTableSessionData?._id?.toString() }],
                },
                { status: "SUCCESS" },
                { session },
              );
            }
          }
        }

        if ((tableSession?.variantsCounts ?? 0) === 1) {
          if (event === "payment.captured") {
            const paymentAlreadyExist = await Payment.findOne({
              razorpayEventId: razorpayEventId,
            });

            if (!paymentAlreadyExist && getOrder) {
              const pos = await BusinessPosConfig.findOne({
                businessId: getOrder?.businessId,
                isDeleted: false,
                active: true,
              });

              if (pos) {
                await UserSession.deleteOne(
                  {
                    tableName:
                      isTableMerge?.parentTableId?.name || getOrder.tableName,
                    businessId: getOrder.businessId,
                  },
                  {
                    session,
                  },
                );

                await KotOrder.updateMany(
                  {
                    tableName:
                      isTableMerge?.parentTableId?.name || getOrder.tableName,
                    businessId: getOrder.businessId,

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
                    businessId: getOrder.businessId,
                    name:
                      isTableMerge?.parentTableId?.name || getOrder?.tableName,
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
                    },
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
          }
        }

        return true;
      }

      console.log("event", event);
      console.log("order_id", payload.payment.entity.order_id);
      console.log("getOrder", getOrder);

      console.log("payload", payload);

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
                tableName:
                  isTableMerge?.parentTableId?.name || getOrder?.tableName,
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
            { billId: tableSession?._id.toString() },
            { status: "FAILED" },
            { session },
          );
        }
      }

      if (event === "payment.captured") {
        const paymentAlreadyExist = await Payment.findOne({
          razorpayEventId: razorpayEventId,
        });

        console.log("step_6", paymentAlreadyExist);

        if (!paymentAlreadyExist && getOrder) {
          console.log("step_7");
          const pos = await BusinessPosConfig.findOne({
            businessId: getOrder?.businessId,
            isDeleted: false,
            active: true,
          });
          const claimCoins = Number(getOrder?.claimedCoins) || 0;
          await PaymentAlert.updateOne(
            {
              tableName:
                isTableMerge?.parentTableId?.name || getOrder?.tableName,
              businessId: getOrder?.businessId,
              isAccepted: false,
              alertType: "OFFLINE",
            },
            { isAccepted: true, isRejected: true },
            { session },
          );
          console.log("step_8");

          let getCashBack = 0;

          if (
            payload?.payment?.entity?.notes?.loyaltyId &&
            getOrder?.userId?.toString()
          ) {
            if (claimCoins > 0) {
              await removeCoins(
                claimCoins,
                isTableMerge?.parentTableId?.name || getOrder?.tableName,
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
              Number(getOrder.couponDiscount),
              Number(getOrder.discount),
            );

            if (getOrder?.cashbackAvailable === false) {
              cashBack = 0;
            }

            const cashBackCoins = await addCoins(
              cashBack,
              getOrder?.userId.toString() || "",
              getOrder?._id.toString() || "",

              isTableMerge?.parentTableId?.name || getOrder?.tableName,
              getOrder?.businessId.toString() || "",
              payload.payment.entity.notes.loyaltyId || "",

              session,
            );

            getCashBack = cashBackCoins;
          }

          console.log("step_9");

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
                tableName:
                  isTableMerge?.parentTableId?.name || getOrder?.tableName,
                claimedCoins: getOrder?.claimedCoins,
                tips: getOrder?.tips,
                razorpayPaymentId: payload.payment.entity.id || nanoid(15),
                razorpayOrderId: payload.payment.entity.order_id,
                razorpayAcquirerData: payload.payment.entity.acquirer_data,
                razorpayEventId: razorpayEventId,
                couponId: getOrder?.couponId || null,
                channelId: getOrder?.channelId || null,
                earnCoins: getCashBack,
                date: Date.now(),
                tax: tableSession?.gst,
                serviceCharge: tableSession?.serviceCharge,
                billId: tableSession?._id.toString(),
                settleType: tableSession?.settleType || "PAYMENT_GATEWAY",
                discount: tableSession?.discount,
                couponDiscount: tableSession?.couponDiscount,
                billItems: tableSession?.items || [],
                billInvoice: tableSession?.billInvoice || 0,
              },
            ],
            { session },
          );

          console.log("step_10");

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
                tableName: `${
                  isTableMerge?.parentTableId?.name || getOrder?.tableName
                }`,
                isAccepted: false,
                userId: getOrder?.userId,
                date: Date.now(),
                mode: payload.payment.entity.method,
              },
            ],
            { session },
          );

          console.log("step_11");

          if (pos) {
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

            console.log("step_12");

            await UserSession.deleteOne(
              {
                tableName:
                  isTableMerge?.parentTableId?.name || getOrder?.tableName,
                businessId: getOrder.businessId,
              },
              {
                session,
              },
            );

            console.log("step_13");

            await KotOrder.updateMany(
              {
                tableName:
                  isTableMerge?.parentTableId?.name || getOrder?.tableName,
                businessId: getOrder.businessId,

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

            console.log("step_14");

            const tableInfo = await Table.findOneAndUpdate(
              {
                businessId: getOrder.businessId,
                name: isTableMerge?.parentTableId?.name || getOrder?.tableName,
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
                },
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

            console.log("step_15");
          }
        }
      }

      console.log("step_16");

      return true;
    });
  } catch (error) {
    throw new Error((error as Error).message || "Internal error in POS order");
  }
}

export { hipalzPosRazorpayWebhookHandler };
