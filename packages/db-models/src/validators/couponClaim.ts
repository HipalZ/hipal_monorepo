import { z } from "zod";
import { ObjectIdSchema } from "./common";

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
