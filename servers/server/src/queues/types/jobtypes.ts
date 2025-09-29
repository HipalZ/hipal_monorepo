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
});

export type sendTemplateTypeValidator = z.infer<typeof sendTemplateSchema>;

export type BillJobTypes = {
  requestOnly: { payload: { orderId: string } };
  requestAndSettle: { payload: { total: number } };
};

export type WhatsAppJobTypes = {
  sendTemplate: sendTemplateTypeValidator;
};

export type JobMap = {
  [QUEUE_NAME.BILL_QUEUE]: BillJobTypes;
  [QUEUE_NAME.WHATSAPP_CAMPAIGN_QUEUE]: WhatsAppJobTypes;
};
