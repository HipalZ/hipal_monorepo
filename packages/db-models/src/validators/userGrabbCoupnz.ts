import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


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
