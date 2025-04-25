import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



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
