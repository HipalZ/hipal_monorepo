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

export const ApplyCouponzSchema = z.object({
  couponId: ObjectIdSchema,
  userId: ObjectIdSchema,
  billValue: z
    .number()
    .min(0, {
      message: "Invalid bill value",
    })
    .positive({
      message: "Invalid bill value",
    }),
  discount: z
    .number()
    .min(0, {
      message: "Invalid discount",
    })
    .positive({
      message: "Invalid discount",
    }),
});
