import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const userCouponClaimSchema = z.object({
  userId: ObjectIdSchema,
  couponId: ObjectIdSchema,
  date: z.number(),
  overAllLimit: z.number().default(0),
  weeklyLimit: z.number().default(0),
  monthlyLimit: z.number().default(0),
  weekelyLastResetDate: z.number().optional(),
  monthlyLastResetDate: z.number().optional(),
});

export type UserCouponClaimType = z.infer<typeof userCouponClaimSchema>;
