import {
  toggleAllPeriodsForBusinessDayByBusinessAndDow,
  toggleSinglePeriod,
} from "@/services/bookingz/business-toggle.service";
import {
  bulkUpdatePeriodsService,
  getFilteredPeriodConfigsService,
  getPeriodsForDayService,
  getSinglePeriodService,
  upsertPeriodConfigService,
} from "@/services/bookingz/day-period.service";
import type { BulkPeriodUpdate } from "@hi/db-models/src/models/bookingz/business-period-config";
import { runInTransaction } from "@hi/utils";
import type { Context } from "hono";

export const getPeriodsForDayController = async (c: Context) => {
  // Extract businessId and dayOfWeek from URL parameters
  const { businessId, dayOfWeek } = c.req.param();
  const dow = parseInt(dayOfWeek, 10);

  // Execute the service call inside a transaction using your runInTransaction helper
  const periods = await runInTransaction(async (session) => {
    return getPeriodsForDayService(businessId, dow, session);
  });

  return c.json({
    status: 200,
    data: periods,
    message: "Periods fetched successfully.",
  });
};

export const getFilteredPeriodConfigsController = async (c: Context) => {
  const { businessId } = c.req.param();
  // after zQueryValidator the parsed query is here:
  const { days, periods } = c.req.valid("query") as {
    days?: number[];
    periods?: number[];
  };
  const data = await runInTransaction((session) =>
    getFilteredPeriodConfigsService(businessId, days, periods, session),
  );
  return c.json({
    status: 200,
    data,
    message: "Filtered period configurations fetched successfully.",
  });
};

export const getSinglePeriodController = async (c: Context) => {
  const { businessId, dayOfWeek, period } = c.req.param();
  const dow = parseInt(dayOfWeek, 10);
  const prd = parseInt(period, 10);

  const periodCfg = await runInTransaction((session) =>
    getSinglePeriodService(businessId, dow, prd, session),
  );

  return c.json({
    status: 200,
    data: periodCfg,
    message: "Period configuration fetched successfully.",
  });
};

export const upsertPeriodConfigController = async (c: Context) => {
  const { businessId, dayOfWeek, period } = c.req.param();
  const dow = parseInt(dayOfWeek, 10);
  const prd = parseInt(period, 10);

  const payload = await c.req.json(); // validated in the route

  const result = await runInTransaction((session) =>
    upsertPeriodConfigService(businessId, dow, prd, payload, session),
  );

  return c.json({
    status: 200,
    data: result,
    message: "Period configuration upserted successfully.",
  });
};

export const bulkUpdatePeriodsController = async (c: Context) => {
  const { businessId } = c.req.param();
  const items = (await c.req.json()) as BulkPeriodUpdate[];
  const updated = await runInTransaction((session) =>
    bulkUpdatePeriodsService(businessId, items, session),
  );
  return c.json({
    status: 200,
    data: updated,
    message: "Periods updated successfully.",
  });
};

export const toggleAllPeriodsForBusinessDayController = async (c: Context) => {
  const { businessId, dayOfWeek } = c.req.param();
  const dow = parseInt(dayOfWeek, 10);

  const result = await runInTransaction(async (session) => {
    return toggleAllPeriodsForBusinessDayByBusinessAndDow(
      businessId,
      dow,
      session,
    );
  });

  return c.json({
    status: 200,
    data: result,
    message: "Business day periods toggled successfully.",
  });
};

export const toggleSinglePeriodController = async (c: Context) => {
  const { businessId, dayOfWeek, period } = c.req.param();

  const dow = parseInt(dayOfWeek, 10);
  const periodNum = parseInt(period, 10);

  const result = await runInTransaction(async (session) => {
    return toggleSinglePeriod(businessId, dow, periodNum, session);
  });

  return c.json({
    status: 200,
    data: result,
    message: "Business period toggled successfully.",
  });
};
