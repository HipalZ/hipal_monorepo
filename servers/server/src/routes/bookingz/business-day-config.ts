import { Hono } from "hono";
import {
  mongoIdZod,
  zDayRange,
  zJsonValidator,
  zParamsValidator,
} from "@hi/db-models";
import { z } from "zod";
import { upsertDayConfigBodySchema } from "@hi/db-models/src/models/bookingz/business-day-config";
import {
  getBusinessDaysController,
  toggleAllDaysForBusinessController,
  toggleDayConfigController,
  upsertBusinessDayConfigController,
} from "@/controllers/bookingz/business-day-config";

export const businessDayConfigRouter = new Hono();

businessDayConfigRouter.get(
  "/days/:businessId",
  zParamsValidator(z.object({ businessId: mongoIdZod })), // validate businessId param
  getBusinessDaysController,
);

businessDayConfigRouter.patch(
  "/:businessId",
  zParamsValidator(z.object({ businessId: mongoIdZod })), // business id
  zJsonValidator(upsertDayConfigBodySchema),
  upsertBusinessDayConfigController,
);

businessDayConfigRouter.patch(
  "/toggle-all-days/:businessId",
  zParamsValidator(z.object({ businessId: mongoIdZod })), // Validate businessId param
  toggleAllDaysForBusinessController,
);

businessDayConfigRouter.patch(
  "/toggle-day/:businessId/:dayOfWeek",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      dayOfWeek: zDayRange,
    }),
  ),
  toggleDayConfigController,
);
