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

export const CouponViewSchema = z.object({
  couponId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  date: z.number(),
  userId: ObjectIdSchema.optional(),
});

export type CouponViewType = z.infer<typeof CouponViewSchema>;
