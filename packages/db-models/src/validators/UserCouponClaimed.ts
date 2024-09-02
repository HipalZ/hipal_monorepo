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

export const userCouponClaimSchema = z.object({
  userId: ObjectIdSchema,
  couponId: ObjectIdSchema,
  date: z.number(),
  overAllLimit: z.number().default(0),
  weeklyLimit: z.number().default(0),
  monthlyLimit: z.number().default(0),
});

export type UserCouponClaimType = z.infer<typeof userCouponClaimSchema>;
