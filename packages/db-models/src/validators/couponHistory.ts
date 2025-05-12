import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const CouponHistorySchema = z.object({
  couponId: ObjectIdSchema,
  couponClaimBy: ObjectIdSchema,
  businessId: ObjectIdSchema,
  paymentId: ObjectIdSchema,
  date: z.number(),
});

export type CouponHistoryType = z.infer<typeof CouponHistorySchema>;
