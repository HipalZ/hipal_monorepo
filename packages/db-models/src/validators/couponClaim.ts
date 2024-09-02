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

export const CouponClaimSchema = z.object({
  couponId: ObjectIdSchema,
  overAllLimit: z.number().default(0),
  weeklyLimit: z.number().default(0),
  monthlyLimit: z.number().default(0),
  date: z.number(),
});

export type CouponClaimType = z.infer<typeof CouponClaimSchema>;
