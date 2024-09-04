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

export const CouponHistorySchema = z.object({
  couponId: ObjectIdSchema,
  couponClaimBy: ObjectIdSchema,
  businessId: ObjectIdSchema,
  paymentId: ObjectIdSchema,
  date: z.number(),
});

export type CouponHistoryType = z.infer<typeof CouponHistorySchema>;
