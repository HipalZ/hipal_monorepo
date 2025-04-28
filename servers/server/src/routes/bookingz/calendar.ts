import { Hono } from "hono";
import { dateSchema, mongoIdZod, startTimeValidator, zParamsValidator, zQueryValidator } from "@hi/db-models";
import { getBookingHistoryController, getBookingsController, getCalendarController, getDateInfoController } from "@/controllers/bookingz/calendar";
import { z } from "zod";
import dayjs from "dayjs";

export const calendarRouter = new Hono();

calendarRouter.get(
  "/getCalendar/:businessId",
  zParamsValidator(z.object({ businessId: mongoIdZod })),
  getCalendarController
);

calendarRouter.get(
  "/getDateInfo/:businessId/:date",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      date: dateSchema
    })
  ),
  getDateInfoController
);

calendarRouter.get(
  "/slotBookings/:businessId/:date/:slot",
  zParamsValidator(
    z.object({
      businessId: mongoIdZod,
      date: dateSchema,
      slot: startTimeValidator
    })
  ),
  getBookingsController
);


calendarRouter.get(
  "/history/:startDate/:endDate",
  zParamsValidator(
    z.object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .superRefine((val, ctx) => {
    if (val.startDate.getTime() > val.endDate.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "startDate must be on or before endDate",
      });
    }
    const todayStart = dayjs().startOf("day").toDate();
    if (val.endDate.getTime() >= todayStart.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "endDate must be before today",
      });
    }
  })
),
  getBookingHistoryController
);