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
  date: z.number(),
  expiryDate: z.number(),
});

export type UserCouponGrabbType = z.infer<typeof userCouponGrabbchema>;
