import mongoose from "mongoose";
import z from "zod";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);
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
