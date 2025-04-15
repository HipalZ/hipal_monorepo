import { Hono } from "hono";

import { businessDayConfigRouter } from "./business-day-config";
import { businessPeriodConfigRouter } from "./business-period-config";
import { couponRouter } from "./coupon";
import { bookingsNativeRouter } from "./native";
import { fn } from "./util";
import {
  activateBookings,
  deactivateBookings,
  updateBookingBusinessCapacity,
} from "@/controllers/bookingz/base";
import { mongoIdZod, zJsonValidator, zParamsValidator } from "@hi/db-models";
import { z } from "zod";
import { bookingBusinessRouter } from "./booking-business";

export const bookingsRouter = new Hono();

bookingsRouter.post(
  "/activate",
  zJsonValidator(
    z.object({
      businessId: mongoIdZod,
    }),
  ),
  activateBookings,
);

bookingsRouter.post(
  "/deactivate",
  zJsonValidator(
    z.object({
      businessId: mongoIdZod,
    }),
  ),
  deactivateBookings,
);

bookingsRouter.patch(
  "/booking-business/:businessId/capacity",
  zParamsValidator(z.object({ businessId: mongoIdZod })),
  zJsonValidator(
    z.object({
      capacity: z.number({ required_error: "Capacity is required" }),
    }),
  ),
  updateBookingBusinessCapacity,
);
bookingsRouter.route("/business-day-config", businessDayConfigRouter);
bookingsRouter.route("/business-period-config", businessPeriodConfigRouter);
bookingsRouter.route("/booking-business", bookingBusinessRouter);
bookingsRouter.route("/coupon", couponRouter);
bookingsRouter.route("/native", bookingsNativeRouter);
bookingsRouter.get("/ui/slots/:businessId/:date/:numGuests", fn); // [manager, customer]
