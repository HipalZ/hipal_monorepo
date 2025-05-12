import { z } from "zod";
import { ObjectIdSchema } from "./common";

const whatsAppAnalyticsUserSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(10).max(10),
  templateId: z.string().min(1).max(200).optional(),
  businessId: ObjectIdSchema,
  status: z.string().min(1).max(100),
  date: z.number().int(),
  campaignId: ObjectIdSchema.optional(),
});

export type WhatsAppAnalyticsUserType = z.infer<
  typeof whatsAppAnalyticsUserSchema
>;
