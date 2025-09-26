import { z } from "zod";

export const BillRequestOnlySchema = z.object({
  payload: z.object({
    orderId: z.string(),
  }),
});

export const BillRequestAndSettleSchema = z.object({
  payload: z.record(z.any()),
  saveOrderData: z.object({ total: z.number() }),
  pos: z.record(z.any()).optional(),
  tableSession: z.record(z.any()).optional(),
});

export const WhatsAppSendMessageSchema = z.object({
  phone: z.string().min(10),
  templateId: z.string(),
});

export const WhatsAppSendCampaignSchema = z.object({
  contacts: z.array(z.string().min(10)),
  templateId: z.string(),
  campaignId: z.string().optional(),
});

export const payloadSchemas = {
  requestOnly: BillRequestOnlySchema,
  requestAndSettle: BillRequestAndSettleSchema,
  sendMessage: WhatsAppSendMessageSchema,
  sendCampaign: WhatsAppSendCampaignSchema,
} as const;
