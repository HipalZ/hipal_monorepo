import {
  toggleAllDaysForBusiness,
  toggleDayConfigService,
} from "@/services/bookingz/business-toggle.service";
import {
  fetchBusinessDaysService,
  upsertDayConfig,
} from "@/services/bookingz/day-period.service";
import { runInTransaction } from "@hi/utils";
import type { Context } from "hono";

export const upsertBusinessDayConfigController = async (c: Context) => {
  // Extract the businessId from route parameters.
  const { businessId } = c.req.param();
  // The JSON body will now have dayOfWeek, startTime, endTime, closedIntervals, isOpen.
  const { dayOfWeek, startTime, endTime, closedIntervals, isOpen } =
    await c.req.json();

  const updatedDayCfg = await runInTransaction(async (session) => {
    return upsertDayConfig(
      businessId,
      dayOfWeek,
      startTime,
      endTime,
      closedIntervals || [],
      typeof isOpen === "boolean" ? isOpen : true,
      session,
    );
  });

  return c.json({
    status: 200,
    data: updatedDayCfg,
    message: "Business Day Config updated successfully.",
  });
};

export const getBusinessDaysController = async (c: Context) => {
  // Extract the businessId from route parameters.
  const { businessId } = c.req.param();

  // Run within a transaction session using the helper function.
  const daysData = await runInTransaction(async (session) => {
    return fetchBusinessDaysService(businessId, session);
  });

  return c.json({
    status: 200,
    data: daysData,
    message: "Business Day Configurations fetched successfully.",
  });
};

export const toggleAllDaysForBusinessController = async (c: Context) => {
  // Extract the businessId from the route parameters
  const { businessId } = c.req.param();

  // Run the toggle operation within a transaction session using the helper function.
  const result = await runInTransaction(async (session) => {
    return toggleAllDaysForBusiness(businessId, session);
  });

  return c.json({
    status: 200,
    data: result,
    message: "Business days toggled successfully.",
  });
};

export const toggleDayConfigController = async (c: Context) => {
  // Extract the businessId and dayOfWeek parameters.
  const { businessId, dayOfWeek } = c.req.param();
  // Parse dayOfWeek as an integer (assuming a value between 0 and 6).
  const dow = parseInt(dayOfWeek, 10);

  // Run the operation within a transaction using your helper.
  const updatedDayConfig = await runInTransaction(async (session) => {
    return toggleDayConfigService(businessId, dow, session);
  });

  return c.json({
    status: 200,
    data: updatedDayConfig,
    message: "Day configuration toggled successfully.",
  });
};
