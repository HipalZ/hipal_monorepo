import z from "zod";
import { ObjectIdSchema } from "./common";

export const whatsAppTemplateAnalyticsSchema = z.object({
  businessId: ObjectIdSchema,
  templateId: z.number(),
  date: z.coerce.number().default(Date.now()),
  reach: z.number().default(0),
  clicks: z.number().default(0),
  replies: z.number().default(0),
  conversion: z.number().default(0),
});

export type WhatsAppTemplateAnalyticsType = z.infer<
  typeof whatsAppTemplateAnalyticsSchema
>;
