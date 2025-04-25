import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



export const CouponHistorySchema = z.object({
  couponId: ObjectIdSchema,
  couponClaimBy: ObjectIdSchema,
  businessId: ObjectIdSchema,
  paymentId: ObjectIdSchema,
  date: z.number(),
});

export type CouponHistoryType = z.infer<typeof CouponHistorySchema>;
