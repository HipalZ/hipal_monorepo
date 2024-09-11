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

export const userCouponGrabbchema = z.object({
  userId: ObjectIdSchema,
  couponId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  count: z.number().default(1),
  date: z.number(),
  expiryDate: z.number(),
  channelId: ObjectIdSchema.optional(),
  dob: z.number().optional(),
  specialday: z.number().optional(),
});

export type UserCouponGrabbType = z.infer<typeof userCouponGrabbchema>;
