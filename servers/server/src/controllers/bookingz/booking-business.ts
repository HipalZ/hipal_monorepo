import { explicitUpsertBookingBusinessService } from "@/services/bookingz/booking-business.service";
import { runInTransaction } from "@hi/utils";
import type { Context } from "hono";

export const upsertExplicitBookingBusinessController = async (c: Context) => {
  const { businessId, date, period } = c.req.param();
  const { couponsRemaining } = await c.req.json();

  const result = await runInTransaction(async (session) => {
    return explicitUpsertBookingBusinessService(
      businessId,
      date,
      parseInt(period, 10),
      couponsRemaining,
      session,
    );
  });

  return c.json({
    status: 200,
    data: result,
    message: "Booking business explicitly updated successfully.",
  });
};
