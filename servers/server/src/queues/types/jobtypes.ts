// src/types/jobTypes.ts

import { z } from "zod";
import { QUEUE_NAME } from "../constants/queueNames";

export interface AxiosError {
  response?: {
    status?: number;
    data?: {
      error?: {
        message?: string;
      };
    };
  };
  message: string;
}

export const sendTemplateSchema = z.object({
  whatsAppApiBaseUrl: z.string(),
  version: z.string(),
  phoneId: z.string(),
  to: z.string(),
  templateName: z.string(),
  languageCode: z.string(),
  components: z.array(z.object({})),
  token: z.string(),
  businessId: z.string(),
  templateId: z.string(),
  campaignId: z.string(),
  userId: z.string(),
  category: z.string(),
});

export type sendTemplateTypeValidator = z.infer<typeof sendTemplateSchema>;

export const pushCustomerIntoQueueSchema = z.object({
  businessName: z.string(),
  address: z.string(),
  bodyVariableSequence: z.array(z.string()),
  imageUrl: z.string(),
  token: z.string(),
  version: z.string(),
  phoneId: z.string(),

  templateName: z.string(),
  languageCode: z.string(),
  whatsAppApiBaseUrl: z.string(),
  businessId: z.string(),
  templateId: z.string(),
  campaignId: z.string(),
  customersArray: z.array(z.object({})),
  category: z.string(),
});

export type pushCustomerIntoQueueTypeValidator = z.infer<
  typeof pushCustomerIntoQueueSchema
>;

export const razorpayOnlinePaymentSchema = z.object({
  date: z.coerce.number(),
  merchantId: z.string(),
  razorpayEventId: z.string(),
  order_id: z.string(),
  id: z.string(),
  event: z.string(),

  status: z.enum(["SUCCESS", "FAILED", "PROCESSING", "PENDING"]),
  acquirer_data: z.object({}),
  error_description: z.string(),
  error_reason: z.string(),
  mode: z.string(),
});

export type RazorpayPaymentHandlerTypeValidator = z.infer<
  typeof razorpayOnlinePaymentSchema
>;

export type BillJobTypes = {
  requestOnly: { payload: { orderId: string } };
  requestAndSettle: { payload: { total: number } };
};

export type WhatsAppJobTypes = {
  sendTemplate: sendTemplateTypeValidator;
  pushCustomerIntoQueue: pushCustomerIntoQueueTypeValidator;
};

export type RazorpayJobTypes = {
  razorpayPaymentHandler: RazorpayPaymentHandlerTypeValidator;
};

export type JobMap = {
  [QUEUE_NAME.BILL_QUEUE]: BillJobTypes;
  [QUEUE_NAME.WHATSAPP_CAMPAIGN_QUEUE]: WhatsAppJobTypes;
  [QUEUE_NAME.RAZORPAY_WEBHOOK_QUEUE]: RazorpayJobTypes;
};
