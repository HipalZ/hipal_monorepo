import { Queue } from 'bullmq';
import { redis } from './connection';
import { QUEUE_NAME } from './constants/queueNames';

// ----------------- BILL QUEUE -----------------
export const billQueue = new Queue(QUEUE_NAME.BILL_QUEUE, {
  connection: redis,

  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: { age: 600 }, // keep 10 min
    removeOnFail: true,
  },
});

// ----------------- WHATSAPP CAMPAIGN QUEUE -----------------

export const whatsappCampaignQueue = new Queue(QUEUE_NAME.WHATSAPP_CAMPAIGN_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: true,
  },
});

// ----------------- RAZORPAY WEBHOOK QUEUE -----------------
export const razorpayWebhookQueue = new Queue(QUEUE_NAME.RAZORPAY_WEBHOOK_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: true,
  },
});

// ----------------- SCAN AUDIT QUEUE -----------------
// Single attempt, no retries — a failed audit is marked ERROR in the
// result doc and must be re-triggered explicitly via /scan_audit/start.
export const scanAuditQueue = new Queue(QUEUE_NAME.SCAN_AUDIT_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});

// ----------------- HOTEL WAKE-UP QUEUE -----------------
// export const hotelWakeUpQueue = new Queue(QUEUE_NAME.HOTEL_WAKEUP_QUEUE, {
//   connection: redis,
//   defaultJobOptions: {
//     attempts: 3,
//     backoff: { type: 'exponential', delay: 3000 },
//     removeOnComplete: true,
//   },
// });
