import z from "zod";
import { ObjectIdSchema } from "./common";

export const whatsAppWalletHistorySchema = z.object({
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  date: z.number().default(Date.now()),
  order_id: ObjectIdSchema,
  status: z.enum(["SUCCESS", "FAILED"]),
  errorReason: z.string().optional(),
  errorDescription: z.string().optional(),
});

export type WhatsAppWalletHistoryType = z.infer<
  typeof whatsAppWalletHistorySchema
>;
