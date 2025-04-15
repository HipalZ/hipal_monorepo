import { Hono } from "hono";
import { fn } from "./util";
import { mongoIdZod, zJsonValidator, zParamsValidator } from "@hi/db-models";
import { z } from "zod";
import {
  getPeriodsForDayController,
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
      dayOfWeek: z
        .string()
        .regex(/^[0-6]$/, "dayOfWeek must be a digit between 0 and 6"),
    }),
  ),
  getPeriodsForDayController,
);

// update a single period
businessPeriodConfigRouter.patch(
  "/period/:businessId/:dayOfWeek/:period",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      dayOfWeek: z.string().regex(/^[0-6]$/, "dayOfWeek must be 0‑6"),
      period: z.string().regex(/^[0-3]$/, "period must be 0‑3"),
    }),
  ),
  zJsonValidator(upsertPeriodPayloadSchema),
  upsertPeriodConfigController,
);

businessPeriodConfigRouter.patch(
  "/toggle-all-periods/:businessId/:dayOfWeek",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod, // Validate that businessId is a valid Mongo ID
      dayOfWeek: z
        .string()
        .regex(/^[0-6]$/, "dayOfWeek must be a digit between 0 and 6"),
    }),
  ),
  toggleAllPeriodsForBusinessDayController,
);

businessPeriodConfigRouter.patch(
  "/toggle-period/:businessId/:dayOfWeek/:period",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      dayOfWeek: z.string().regex(/^[0-6]$/, "dayOfWeek must be 0-6"),
      period: z.string().regex(/^[0-3]$/, "period must be 0-3"),
    }),
  ),
  toggleSinglePeriodController,
);
