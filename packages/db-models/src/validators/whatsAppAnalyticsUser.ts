import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


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
