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

export const CouponLinkSchema = z.object({
  businessId: ObjectIdSchema,
  channelId: ObjectIdSchema,
  couponId: ObjectIdSchema,
  link: z.string().min(1).max(70),
  isActive: z.boolean().default(true),
  date: z.number(),
});

export type CouponLinkType = z.infer<typeof CouponLinkSchema>;
