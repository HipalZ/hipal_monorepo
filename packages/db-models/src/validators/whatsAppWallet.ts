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
export const whatsAppWalletSchema = z.object({
  businessId: ObjectIdSchema,
  currentBalance: z.number().default(0),

  date: z.number().default(Date.now()),
});

export type WhatsAppWalletType = z.infer<typeof whatsAppWalletSchema>;
