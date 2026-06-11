import type { Job } from "bullmq";
import { QUEUE_NAME, type QueueName } from "../constants/queueNames";
import { billHandlers } from "./bill";
import { hotelWakeUpHandlers } from "./hotelWakeUp";
import { razorpayHandlers } from "./razorpayPayment";
import { scanAuditHandlers } from "./scanAudit";
import { whatsappHandlers } from "./whatsAppCampain";
export type HandlerFn = (job: Job) => Promise<unknown>;
export const handlers: Record<QueueName, Record<string, HandlerFn>> = {
  [QUEUE_NAME.BILL_QUEUE]: billHandlers,
  [QUEUE_NAME.WHATSAPP_CAMPAIGN_QUEUE]: whatsappHandlers,
  [QUEUE_NAME.RAZORPAY_WEBHOOK_QUEUE]: razorpayHandlers,
  [QUEUE_NAME.HOTEL_WAKEUP_QUEUE]: hotelWakeUpHandlers,
  [QUEUE_NAME.SCAN_AUDIT_QUEUE]: scanAuditHandlers,
};
