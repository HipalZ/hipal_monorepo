import { z } from "zod";

export const QUEUE_NAME = {
  BILL_QUEUE: "billQueue",
  WHATSAPP_CAMPAIGN_QUEUE: "whatsappCampaignQueue",
  RAZORPAY_WEBHOOK_QUEUE: "razorpayWebhookQueue",
} as const;

export const queueNames = [
  QUEUE_NAME.BILL_QUEUE,
  QUEUE_NAME.WHATSAPP_CAMPAIGN_QUEUE,
  QUEUE_NAME.RAZORPAY_WEBHOOK_QUEUE,
] as const;

export const queueNamesEnum = z.enum(queueNames);
export type QueueName = z.infer<typeof queueNamesEnum>;
