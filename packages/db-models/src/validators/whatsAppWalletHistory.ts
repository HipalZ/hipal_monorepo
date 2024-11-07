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
  amount: z.number().default(0),
  discount: z.number().default(0),
  date: z.number().default(Date.now()),
});

export type WhatsAppWalletHistoryType = z.infer<
  typeof whatsAppWalletHistorySchema
>;
