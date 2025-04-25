import z from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


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
