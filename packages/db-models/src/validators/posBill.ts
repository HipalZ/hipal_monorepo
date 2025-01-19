import mongoose from "mongoose";
import { z } from "zod";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string({
      message: "Invalid ObjectId",
    })
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);
export const posBillSchema = z.object({
  billRequestId: z.string().min(3).max(200),
  items: z.array(z.object({})).default([]),
  billInfo: z.object({}).default({}),

  businessId: ObjectIdSchema,
  createdAt: z.date().optional(),
});

export type PosBillType = z.infer<typeof posBillSchema>;
