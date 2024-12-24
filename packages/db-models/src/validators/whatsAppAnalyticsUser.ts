import mongoose from "mongoose";
import { z } from "zod";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);
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
