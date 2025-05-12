import { z } from "zod";
import { ObjectIdSchema } from "./common";

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
