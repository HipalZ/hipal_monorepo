import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const CouponLinkSchema = z.object({
  businessId: ObjectIdSchema,
  channelId: ObjectIdSchema,
  couponId: ObjectIdSchema,
  link: z.string().min(1).max(70),
  isActive: z.boolean().default(true),
  date: z.number(),
});

export type CouponLinkType = z.infer<typeof CouponLinkSchema>;
