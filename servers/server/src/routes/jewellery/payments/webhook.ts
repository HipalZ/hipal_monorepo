import {
  BusinessSettings,
  JewelleryOrder,
  JewelleryPayment,
  JewelleryPaymentAlert,
  LoyaltySettings,
} from "@hi/db-models";
import type { RazorpayWebhookHeaders } from "@hi/db-models/src/validators";

import {
  RazorpayWebhookHeadersSchema,
  jewelleryRazorpayWebhookBodySchema,
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

      const bodyResult = jewelleryRazorpayWebhookBodySchema.safeParse(body);

      if (!bodyResult.success) {
        return respond(c, "Invalid body", true, 200, {});
      }

      //@ts-ignore
      const { event, payload } = bodyResult.data;

      const getOrder = await JewelleryOrder.findOne({
        orderId: payload.payment.entity.orderId,
      });

      const businessLoyalty = await LoyaltySettings.findOne({
        businessId: getOrder?.businessId,
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
                status: "FAIL",
                coinsApplied: claimCoins > 0,
                isAccepted: false,
                date: Date.now(),
                message: `Fail ${getOrder?.total}`,
                mode: payload?.payment?.entity?.method,
              },
            ],
            { session },
          );

          await JewelleryOrder.updateOne(
            { _id: getOrder?._id },
            {
              $set: {
                isPaid: "FAIL",
              },
            },
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
              orderId: getOrder?._id,
              isAccepted: false,
              alertType: "OFFLINE",
            },
            { isAccepted: true, isRejected: true },
            { session },
          );

          let getCashBack = 0;

          if (businessLoyalty?.loyaltyId && getOrder?.userId?.toString()) {
            if (claimCoins > 0) {
              await deductUserCoins(
                claimCoins,
                businessLoyalty.loyaltyId || "",
                getOrder?._id.toString() || "",
                getOrder?.userId.toString() || "",
                session,
              );
            }
            const cashBack = await calculateCashbackCoins(
              getOrder?.businessId.toString(),
              getOrder?.subTotal || 0,
              claimCoins,
              Number(getOrder.couponDiscount),
              Number(getOrder.discount),
            );

            const cashBackCoins = await creditUserCoins(
              cashBack,
              getOrder?.userId.toString() || "",
              getOrder?._id.toString() || "",
              getOrder?.businessId.toString() || "",
              businessLoyalty.loyaltyId || "",
              session,
            );
            getCashBack = cashBackCoins;
          }

          await JewelleryOrder.updateOne(
            { _id: getOrder._id },
            {
              $set: {
                isPaid: "SUCCESS",
              },
            },
            { session },
          );

          const createPayment = await JewelleryPayment.create(
            [
              {
                businessId: getOrder?.businessId,
                mode: payload.payment.entity.method,
                userId: getOrder?.userId,
                orderId: getOrder?._id,
                paymentMode: "online",
                razorpayPaymentId: payload.payment.entity.id || nanoid(15),
                razorpayOrderId: getOrder?.razorpayOrderId,
                razorpayAcquirerData: payload.payment.entity.acquirer_data,
                razorpayEventId: razorpayEventId,
                earnCoins: getCashBack,
                date: Date.now(),
                settleType: "PAYMENT_GATEWAY",
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
                coinsApplied: claimCoins > 0,
                status: "SUCCESS",
                orderId: getOrder?._id,
                message: `Paid ${getOrder?.total}`,
                isAccepted: false,
                date: Date.now(),
                mode: payload.payment.entity.method,
              },
            ],
            { session },
          );

          await JewelleryPaymentAlert.updateOne(
            {
              orderId: getOrder?._id,
              isAccepted: false,
              alertType: "OFFLINE",
            },
            { isAccepted: true, isRejected: true },
            { session },
          );
        }
      }

      return respond(c, "Webhook received successfully", false, 200, {});
    });
  })

  .get(
    "/status/:orderId",

    zValidator("param", z.object({ orderId: z.string() })),

    async (c) => {
      const { orderId } = c.req.param();

      const fetchPayment = await JewelleryOrder.findOne({
        _id: orderId,
      });

      return respond(c, "Order fetched", false, 200, {
        status: fetchPayment?.isPaid,
      });
    },
  );

export default webhookRouter;
