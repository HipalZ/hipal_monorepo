import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const CouponViewSchema = z.object({
  couponId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  date: z.number(),
});

export type CouponViewType = z.infer<typeof CouponViewSchema>;
