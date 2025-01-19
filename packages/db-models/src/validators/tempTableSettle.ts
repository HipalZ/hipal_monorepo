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
const tempTableSettleSchema = z.object({
  businessId: ObjectIdSchema,
  tableName: z.string().min(1).max(100),
  settleBy: z.string().min(1).max(100).optional(),
  createdAt: z.date().optional(),
  hiCode: z.string().min(1).max(100).optional(),
});

export type TempTebleSettleType = z.infer<typeof tempTableSettleSchema>;
