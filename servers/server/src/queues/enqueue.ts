// src/queues/enqueue.ts
import type { QUEUE_NAME } from "./constants/queueNames";
import { billQueue, whatsappCampaignQueue } from "./queueFactory";
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
