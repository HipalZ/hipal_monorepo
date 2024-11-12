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
