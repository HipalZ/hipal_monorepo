// src/queues/enqueue.ts
import type { QUEUE_NAME } from "./constants/queueNames";
import { billQueue, hotelWakeUpQueue, scanAuditQueue, whatsappCampaignQueue,razorpayWebhookQueue } from "./queueFactory";
import type { JobMap } from "./types/jobtypes";

export async function enqueueBillJob<
  T extends keyof JobMap[typeof QUEUE_NAME.BILL_QUEUE],
>(
  type: T,
  data: JobMap[typeof QUEUE_NAME.BILL_QUEUE][T],
  opts: { delay?: number } = {},
) {
  return await billQueue.add(type as string, data, opts);
}

export async function enqueueWhatsAppJob<
  T extends keyof JobMap[typeof QUEUE_NAME.WHATSAPP_CAMPAIGN_QUEUE],
>(
  type: T,
  data: JobMap[typeof QUEUE_NAME.WHATSAPP_CAMPAIGN_QUEUE][T],
  opts: { delay?: number } = {},
) {
  return await whatsappCampaignQueue.add(type as string, data, opts);
}

export async function enqueueRazorpayJob<
  T extends keyof JobMap[typeof QUEUE_NAME.RAZORPAY_WEBHOOK_QUEUE],
>(
  type: T,
  data: JobMap[typeof QUEUE_NAME.RAZORPAY_WEBHOOK_QUEUE][T],
  opts: { delay?: number } = {},
) {
  return await razorpayWebhookQueue.add(type as string, data, opts);
}

export async function enqueueScanAuditJob<
  T extends keyof JobMap[typeof QUEUE_NAME.SCAN_AUDIT_QUEUE],
>(
  type: T,
  data: JobMap[typeof QUEUE_NAME.SCAN_AUDIT_QUEUE][T],
  opts: { delay?: number; jobId?: string } = {},
) {
  return await scanAuditQueue.add(type as string, data, opts);
}

export async function enqueueHotelWakeUpJob<
  T extends keyof JobMap[typeof QUEUE_NAME.HOTEL_WAKEUP_QUEUE],
>(
  type: T,
  data: JobMap[typeof QUEUE_NAME.HOTEL_WAKEUP_QUEUE][T],
  opts: { delay?: number; jobId?: string } = {},
) {
  return await hotelWakeUpQueue.add(type as string, data, opts);
}
