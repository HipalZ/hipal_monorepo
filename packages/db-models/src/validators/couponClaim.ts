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
  weekelyLastResetDate: z.number().optional(),
  monthlyLastResetDate: z.number().optional(),
  date: z.number(),
});

export const CouponClaim = z.object({
  userId: ObjectIdSchema,
  couponId: ObjectIdSchema,
  overAllLimit: z.number().default(0),
  weeklyLimit: z.number().default(0),
  monthlyLimit: z.number().default(0),
  weekelyLastResetDate: z.number().optional(),
  monthlyLastResetDate: z.number().optional(),
  date: z.number(),
});

export type CouponClaimType = z.infer<typeof CouponClaimSchema>;
export type CouponType = z.infer<typeof CouponClaim>;
