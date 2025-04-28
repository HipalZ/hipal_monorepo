
import { upsertExplicitBookingBusinessController } from "@/controllers/bookingz/booking-business";
import {
  dateSchema,
  mongoIdZod,
  zJsonValidator,
  zParamsValidator,
} from "@hi/db-models";
import { Hono } from "hono";
import { z } from "zod";

export const bookingBusinessRouter = new Hono();

bookingBusinessRouter.patch(
  "/explicit-booking/:businessId/:date/:period",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      date: dateSchema,                           // ← now parsed to JS Date at local midnight
      period: z.coerce
        .number()
        .int()
        .min(0)
        .max(3),
    }),
  ),
  zJsonValidator(
    z
      .object({
        couponsRemaining: z
          .array(
            z.object({ couponId: mongoIdZod, remaining: z.number().min(0) }),
          )
          .optional(),
        isOpen: z.boolean().optional(),
      })
      .refine(
        (d) => d.couponsRemaining !== undefined || d.isOpen !== undefined,
        { message: "Provide at least couponsRemaining or isOpen" },
      ),
  ),
  upsertExplicitBookingBusinessController,
);
