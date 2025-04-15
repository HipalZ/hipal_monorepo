import { runInTransaction } from "@hi/utils";
import type { Context } from "hono";
import { setBusinessBookingActive } from "../../services/bookingz/business-toggle.service";
import { updateBusinessCapacity } from "@/services/bookingz/ capacity.service";

export const activateBookings = async (c: Context) => {
  console.log("running activateBookings");
  const { businessId } = await c.req.json();
  const result = await runInTransaction(async (session) => {
    return setBusinessBookingActive(businessId, true, session);
  });
  // Cast result as any (or your expected type)
  return c.json({
    status: 200,
    data: result as any,
    message: "Bookings activated successfully.",
  });
};

export const deactivateBookings = async (c: Context) => {
  const { businessId } = await c.req.json();
  const result = await runInTransaction(async (session) => {
    return setBusinessBookingActive(businessId, false, session);
  });
  return c.json({
    status: 200,
    data: result as any,
    message: "Bookings deactivated successfully.",
  });
};

export const updateBookingBusinessCapacity = async (c: Context) => {
  // Extract businessId from route params and capacity from JSON body.
  const { businessId } = c.req.param();
  const { capacity } = await c.req.json();

  const updatedBusiness = await runInTransaction(async (session) => {
    return updateBusinessCapacity(businessId, capacity, session);
  });

  return c.json({
    status: 200,
    data: updatedBusiness,
    message: "Business capacity updated successfully.",
  });
};
