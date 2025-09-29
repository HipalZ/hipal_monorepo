import { z } from "zod";
import { ObjectIdSchema } from "./common";

const whatsAppAnalyticsUserSchema = z.object({
  templateId: z.string().min(1).max(200).optional(),
  businessId: ObjectIdSchema,
  status: z.string().min(1).max(100),
  date: z.number().int(),
  campaignId: ObjectIdSchema.optional(),
  messageId: z.string().min(1).max(200),
  userId: ObjectIdSchema.optional(),
  error: z.array(z.any()).optional().default([]),
});

export type WhatsAppAnalyticsUserType = z.infer<
  typeof whatsAppAnalyticsUserSchema
>;
