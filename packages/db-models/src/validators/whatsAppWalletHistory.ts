import z from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


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
