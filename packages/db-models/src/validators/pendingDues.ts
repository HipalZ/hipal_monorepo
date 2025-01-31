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
export const pendingDuesSchema = z.object({
  businessId: ObjectIdSchema,
  billId: ObjectIdSchema,
  duesUserId: ObjectIdSchema,
  isSettled: z.boolean().default(false),
  date: z.number(),
});

export type PendingDuesType = z.infer<typeof pendingDuesSchema>;
