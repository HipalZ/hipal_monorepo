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
export const whatsAppLimitSchema = z.object({
  businessId: ObjectIdSchema,
  templateLimit: z.number().default(10),
  tier: z.number().max(5).default(1),
  date: z.number().default(Date.now()),
});

export type WhatsAppLimitType = z.infer<typeof whatsAppLimitSchema>;
