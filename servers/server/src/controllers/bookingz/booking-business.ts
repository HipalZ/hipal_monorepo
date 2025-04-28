
import { explicitUpsertBookingBusinessService } from "@/services/bookingz/booking-business.service";
import { CouponAllocInput } from "@hi/db-models/src/models/bookingz/business-period-config";
import { runInTransaction } from "@hi/utils";
import type { Context } from "hono";

export const upsertExplicitBookingBusinessController = async (c: Context) => {
  // Now dateParam is a JS Date thanks to dateSchema
  const { businessId, date: dateParam, period } = c.req.valid("param") as {
    businessId: string;
    date: Date;
    period: number;
  };
  const { couponsRemaining: alloc, isOpen } = await c.req.json<{
    couponsRemaining?: CouponAllocInput[];
    isOpen?: boolean;
  }>();

  const result = await runInTransaction((session) =>
    explicitUpsertBookingBusinessService(
      businessId,
      dateParam,      // ← Date, not string
      period,
      { alloc, isOpen },
      session,
    ),
  );

  return c.json({
    status: 200,
    data: result,
    message: "Booking business explicitly updated successfully.",
  });
};