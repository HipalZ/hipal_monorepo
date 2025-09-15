import {
  BusinessSettings,
  JewelleryOrder,
  JewelleryPayment,
  JewelleryPaymentAlert,
} from "@hi/db-models";
import type { RazorpayWebhookHeaders } from "@hi/db-models/src/validators";

import {
  RazorpayWebhookBodySchema,
  RazorpayWebhookHeadersSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getMerchantConfig } from "../../../utils/cacheHelper";
import {
  calculateCashbackCoins,
  creditUserCoins,
  deductUserCoins,
} from "../../../utils/jewellery/common";
import type { MerchantConfig } from "../../../utils/razorpay-wrapper";
import { respond } from "../../../utils/response";

const webhookRouter = new Hono()
  .post("/razorpay_webhook/:merchantId", async (c) => {
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
        console.log("Webhook secret not found");
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

      const getOrder = await JewelleryOrder.findOne({
        orderId: payload.payment.entity.order_id,
      });

      if (event === "payment.failed") {
        const claimCoins = Number(getOrder?.claimedCoins) || 0;
        const alertExist = await JewelleryPaymentAlert.findOne({
          orderId: getOrder?._id,
          status: "FAIL",
          alertType: "ONLINE",
        });
        if (!alertExist) {
          await JewelleryPaymentAlert.create(
            [
              {
                errorReason: payload.payment.entity.error_reason,
                errorDescription: payload.payment.entity.error_description,
                businessId: getOrder?.businessId,
                alertType: "ONLINE",
                orderId: getOrder?._id,
                userId: getOrder?.userId,
                status: "FAIL",
                coinsApplied: claimCoins > 0,
                isAccepted: false,
                date: Date.now(),
                message: `Fail ${getOrder?.total}`,
                couponId: payload?.payment?.entity.notes?.couponId,
                mode: payload?.payment?.entity?.method,
              },
            ],
            { session },
          );
        }
      }

      if (event === "payment.captured") {
        const paymentAlreadyExist = await JewelleryPayment.findOne({
          razorpayEventId: razorpayEventId,
        });

        if (!paymentAlreadyExist && getOrder) {
          const claimCoins = Number(getOrder?.claimedCoins) || 0;
          await JewelleryPaymentAlert.updateOne(
            {
              businessId: getOrder?.businessId,
              isAccepted: false,
              alertType: "OFFLINE",
            },
            { isAccepted: true, isRejected: true },
            { session },
          );

          let getCashBack = 0;

          if (
            payload?.payment?.entity?.notes?.loyaltyId &&
            getOrder?.userId?.toString()
          ) {
            if (claimCoins > 0) {
              await deductUserCoins(
                claimCoins,
                payload.payment.entity.notes.loyaltyId || "",
                getOrder?._id.toString() || "",
                getOrder?.userId.toString() || "",
                session,
              );
            }
            let cashBack = await calculateCashbackCoins(
              getOrder?.businessId.toString(),
              getOrder?.billValue || 0,
              claimCoins,
              Number(getOrder.couponDiscount),
              Number(getOrder.discount),
            );
            if (getOrder?.cashbackAvailable === false) {
              cashBack = 0;
            }
            const cashBackCoins = await creditUserCoins(
              cashBack,
              getOrder?.userId.toString() || "",
              getOrder?._id.toString() || "",
              getOrder?.businessId.toString() || "",
              payload.payment.entity.notes.loyaltyId || "",
              session,
            );
            getCashBack = cashBackCoins;
          }

          const createPayment = await JewelleryPayment.create(
            [
              {
                businessId: getOrder?.businessId,
                total: getOrder?.total,
                subTotal: getOrder?.billValue,
                mode: payload.payment.entity.method,
                userId: getOrder?.userId,
                order_id: getOrder?._id,
                paymentMode: "online",
                claimedCoins: getOrder?.claimedCoins,
                tips: getOrder?.tips,
                razorpayPaymentId: payload.payment.entity.id || nanoid(15),
                razorpayOrderId: payload.payment.entity.order_id,
                razorpayAcquirerData: payload.payment.entity.acquirer_data,
                razorpayEventId: razorpayEventId,
                couponId: getOrder?.couponId || null,
                earnCoins: getCashBack,
                date: Date.now(),
                tax: 0,
                serviceCharge: 0,
                settleType: "PAYMENT_GATEWAY",
                discount: 0,
                couponDiscount: getOrder?.couponDiscount || 0,
                billItems: [],
              },
            ],
            { session },
          );

          await JewelleryPaymentAlert.create(
            [
              {
                businessId: getOrder?.businessId,
                alertType: "ONLINE",
                payment_id: createPayment[0]._id,
                coinsApplied: claimCoins > 0,
                status: "SUCCESS",
                orderId: getOrder?._id,
                message: `Paid ${getOrder?.total}`,
                isAccepted: false,
                userId: getOrder?.userId,
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

  .post(
    "/status/:orderId",

    zValidator("param", z.object({ orderId: z.string() })),

    async (c) => {
      const { orderId } = c.req.param();

      const getOrder = await JewelleryOrder.findOne({}, { orderId });

      if (!getOrder) {
        return respond(c, "Order not found", true, 404, {});
      }

      const getPayment = await JewelleryPayment.findOne(
        { order_id: getOrder._id },
        {},
      );

      if (!getPayment) {
        return respond(c, "Payment not found", true, 404, {});
      }

      return respond(c, "Payment found", false, 200, {
        paymentId: getPayment._id,
      });
    },
  );

export default webhookRouter;
