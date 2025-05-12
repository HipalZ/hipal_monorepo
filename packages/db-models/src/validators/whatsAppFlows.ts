import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const whatsAppFlowSchema = z.object({
  name: z.string().min(3).max(100),
  businessId: ObjectIdSchema,
  status: z.boolean().default(true),
  description: z.string().default(""),
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
  description: z.string().default(""),
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
