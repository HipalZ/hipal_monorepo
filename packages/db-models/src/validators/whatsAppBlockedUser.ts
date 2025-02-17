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
export const whatsAppBlockedUserSchema = z.object({
  phone: z.string().min(10).max(10),
});

export type WhatsAppBlockedUserType = z.infer<typeof whatsAppBlockedUserSchema>;
