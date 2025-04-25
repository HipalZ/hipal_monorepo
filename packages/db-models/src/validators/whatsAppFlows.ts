import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



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
