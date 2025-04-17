import { Hono } from "hono";
import {
  mongoIdZod,
  zDayRange,
  zJsonValidator,
  zParamsValidator,
  zPeriodRange,
} from "@hi/db-models";
import { z } from "zod";
import {
  getPeriodsForDayController,
  getSinglePeriodController,
  toggleAllPeriodsForBusinessDayController,
  toggleSinglePeriodController,
  upsertPeriodConfigController,
} from "@/controllers/bookingz/business-period-config";
import { upsertPeriodPayloadSchema } from "@hi/db-models/src/models/bookingz/business-period-config";

export const businessPeriodConfigRouter = new Hono();

// get all periods for a day
businessPeriodConfigRouter.get(
  "/periods/:businessId/:dayOfWeek",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      dayOfWeek: zDayRange,
    }),
  ),
  getPeriodsForDayController,
);

// — GET one period’s details
businessPeriodConfigRouter.get(
  "/period/:businessId/:dayOfWeek/:period",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      dayOfWeek: zDayRange,
      period: zPeriodRange,
    }),
  ),
  getSinglePeriodController,
);

// update a single period
businessPeriodConfigRouter.patch(
  "/period/:businessId/:dayOfWeek/:period",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      dayOfWeek: zDayRange,
      period: zPeriodRange,
    }),
  ),
  zJsonValidator(upsertPeriodPayloadSchema),
  upsertPeriodConfigController,
);

businessPeriodConfigRouter.patch(
  "/toggle-all-periods/:businessId/:dayOfWeek",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      dayOfWeek: zDayRange,
    }),
  ),
  toggleAllPeriodsForBusinessDayController,
);

businessPeriodConfigRouter.patch(
  "/toggle-period/:businessId/:dayOfWeek/:period",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      dayOfWeek: zDayRange,
      period: zPeriodRange,
    }),
  ),
  toggleSinglePeriodController,
);
