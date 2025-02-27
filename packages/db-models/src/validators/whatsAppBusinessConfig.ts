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
export const whatsAppBusinessConfigSchema = z.object({
  businessId: ObjectIdSchema,
  token: z.string().min(3).max(400),
  phoneId: z.string().min(3).max(200),
  whatsAppAccountId: z.string().min(3).max(200),
  appId: z.string().min(3).max(200),
  configId: z.string().min(3).max(200).optional(),
  version: z.string().min(3).max(200),
  templateLimit: z.number().int().min(0).max(1000),
  planId: ObjectIdSchema.optional(),
  whatsAppPhone: z.string().min(10).max(10),
  menuRedirection: z.string().min(2).max(200),
  ownerId: ObjectIdSchema.optional(),
  marketingTemplateCost: z.number().default(0.89),
  utilityTemplateCost: z.number().default(0.2),
});

export type WhatsAppBusinessConfigType = z.infer<
  typeof whatsAppBusinessConfigSchema
>;
