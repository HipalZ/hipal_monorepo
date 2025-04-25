import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



export const CouponLinkSchema = z.object({
  businessId: ObjectIdSchema,
  channelId: ObjectIdSchema,
  couponId: ObjectIdSchema,
  link: z.string().min(1).max(70),
  isActive: z.boolean().default(true),
  date: z.number(),
});

export type CouponLinkType = z.infer<typeof CouponLinkSchema>;
