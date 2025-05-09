import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const userCouponGrabbchema = z.object({
  userId: ObjectIdSchema,
  couponId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  count: z.number().default(1),
  date: z.number(),
  expiryDate: z.number(),
  channelId: ObjectIdSchema.optional(),
  dob: z.number().optional(),
  isDeleted: z.boolean().default(false),
  specialday: z.number().optional(),
});

export type UserCouponGrabbType = z.infer<typeof userCouponGrabbchema>;
