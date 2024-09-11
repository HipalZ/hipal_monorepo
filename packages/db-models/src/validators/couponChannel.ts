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

export const CouponChannelSchema = z.object({
  businessId: ObjectIdSchema,
  name: z
    .string({
      message: "Invalid name",
    })
    .min(1, {
      message: " required min 1 character",
    })
    .max(50, {
      message: " required max 50 character",
    }),
  isActive: z.boolean().default(true),
  date: z.number(),
  count: z.number().default(1),
  //TODO: REMOVE THIS FIELD
  couponIds: z.array(ObjectIdSchema).default([]),
});

export type CouponChannelType = z.infer<typeof CouponChannelSchema>;
