import { z } from "zod";
import { ObjectIdSchema } from "./common";

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
