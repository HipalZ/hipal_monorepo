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
const whatsAppPlanSchema = z.object({
  name: z.string().min(3).max(200),
  price: z.number().int().min(0).max(50000),
  description: z.string().min(3).max(400),
  offering: z.array(z.string().min(3).max(200)),
  utilityTemplateCharge: z.number().default(0.2),
  marketingTemplateCharge: z.number().default(0.89),
  businessId: ObjectIdSchema,
});

export type WhatsAppPlanType = z.infer<typeof whatsAppPlanSchema>;
