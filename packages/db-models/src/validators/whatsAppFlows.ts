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

export const whatsAppFlowSchema = z.object({
  name: z.string().min(3).max(100),
  businessId: ObjectIdSchema,
  status: z.boolean().default(true),
  flows: z.array(
    z.object({
      templateName: z.string().min(3).max(100),
      templateId: z.string().min(3).max(100),
      triggerAt: z.number().default(0),
    }),
  ),
});

export const updateWhatsAppFlowSchema = z.object({
  name: z.string().min(3).max(100),
  businessId: ObjectIdSchema,
  status: z.boolean().default(true),
  flows: z.array(
    z.object({
      templateName: z.string().min(3).max(100),
      templateId: z.string().min(3).max(100),
      triggerAt: z.number().default(0),
    }),
  ),
  flowId: ObjectIdSchema,
});

export type WhatsAppFlowType = z.infer<typeof whatsAppFlowSchema>;
