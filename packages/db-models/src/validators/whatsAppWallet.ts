import z from "zod";
import { ObjectIdSchema } from "./common";

export const whatsAppWalletSchema = z.object({
  businessId: ObjectIdSchema,
  currentBalance: z.number().default(0),

  date: z.number().default(Date.now()),
});

export type WhatsAppWalletType = z.infer<typeof whatsAppWalletSchema>;
