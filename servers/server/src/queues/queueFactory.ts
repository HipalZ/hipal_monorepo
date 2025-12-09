import { Queue } from "bullmq";
import { redis } from "./connection";
import { QUEUE_NAME } from "./constants/queueNames";

// ----------------- BILL QUEUE -----------------
export const billQueue = new Queue(QUEUE_NAME.BILL_QUEUE, {
  connection: redis,

  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 5000 },
    removeOnComplete: { age: 600 }, // keep 10 min
    removeOnFail: true,
  },
});

// ----------------- WHATSAPP CAMPAIGN QUEUE -----------------
export const whatsappCampaignQueue = new Queue(
  QUEUE_NAME.WHATSAPP_CAMPAIGN_QUEUE,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
    },
  },
);

// ----------------- RAZORPAY WEBHOOK QUEUE -----------------
export const razorpayWebhookQueue = new Queue(
  QUEUE_NAME.RAZORPAY_WEBHOOK_QUEUE,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
    },
  },
);
