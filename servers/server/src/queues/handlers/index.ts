import type { Job } from "bullmq";
import { QUEUE_NAME, type QueueName } from "../constants/queueNames";
import { billHandlers } from "./bill";
import { razorpayHandlers } from "./razorpayPayment";
import { whatsappHandlers } from "./whatsAppCampain";
export type HandlerFn = (job: Job) => Promise<unknown>;
export const handlers: Record<QueueName, Record<string, HandlerFn>> = {
  [QUEUE_NAME.BILL_QUEUE]: billHandlers,
  [QUEUE_NAME.WHATSAPP_CAMPAIGN_QUEUE]: whatsappHandlers,
  [QUEUE_NAME.RAZORPAY_WEBHOOK_QUEUE]: razorpayHandlers,
};
