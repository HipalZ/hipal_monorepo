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

export const WhatsappWABASchema = z.object({
  displayName: z.string().min(2).max(2000),
  displayNumber: z.string().min(2).max(2000),
  email: z.string().email().optional(),
  facebookId: z.string().min(2).max(2000).optional(),
  facebookPassword: z.string().min(2).max(2000).optional(),
  businessId: ObjectIdSchema,
  status: z.boolean().default(false),
  date: z.number().default(Date.now()),
});

export type WhatsappWABAType = z.infer<typeof WhatsappWABASchema>;
