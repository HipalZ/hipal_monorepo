import { upsertExplicitBookingBusinessController } from "@/controllers/bookingz/booking-business";
import { mongoIdZod, zJsonValidator, zParamsValidator } from "@hi/db-models";
import { Hono } from "hono";
import { z } from "zod";

export const bookingBusinessRouter = new Hono();

bookingBusinessRouter.patch(
  "/explicit-booking/:businessId/:date/:period",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
      period: z.string().regex(/^[0-3]$/, "Period must be 0-3"),
    }),
  ),
  zJsonValidator(
    z.object({
      couponsRemaining: z.array(
        z.object({
          couponId: mongoIdZod,
          remaining: z.number().min(0),
        }),
      ),
    }),
  ),
  upsertExplicitBookingBusinessController,
);
