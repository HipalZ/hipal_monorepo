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

export const userSessionSchema = z.object({
  customerPhone: z.string().min(1).max(10),
  businessId: ObjectIdSchema,
  createdAt: z.date(),
});

export type UserSessionType = z.infer<typeof userSessionSchema>;
