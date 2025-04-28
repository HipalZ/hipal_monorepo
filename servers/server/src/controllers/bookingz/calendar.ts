import type { Context } from "hono";
import { runInTransaction } from "@hi/utils";
import { getBookingHistoryService, getBookingsService, getCalendarService, getDateInfoService } from "@/services/bookingz/calendar.service";
import dayjs from "dayjs";

export const getCalendarController = async (c: Context) => {
  // extract businessId from path params
  const { businessId } = c.req.param();
  const data = await runInTransaction(session => {
    return getCalendarService(businessId, session);
  });
  return c.json({ status: 200, data, message: "Calendar fetched successfully." });
};

export const getDateInfoController = async (c: Context) => {
  const { businessId, date } = c.req.valid("param") as { businessId: string; date: Date };
  const data = await runInTransaction(session =>
    getDateInfoService(businessId, date, session)
  );
  return c.json({ status: 200, data, message: "Date info fetched." });
};
export const getBookingsController = async (c: Context) => {
  const { businessId, date, slot } = c.req.valid("param") as {
    businessId: string;
    date: Date;
    slot: string;
  };
  const data = await runInTransaction(session =>
    getBookingsService(businessId, date, slot, session)
  );
  return c.json({ status: 200, data, message: "Bookings fetched." });
};

export const getBookingHistoryController = async (c: Context) => {
  const { startDate, endDate } = c.req.valid("param") as {
    startDate: Date;
    endDate: Date;
  };

  // ——— Guard: span not exceed 5 years ———
  const years = dayjs(endDate).diff(dayjs(startDate), 'year', true);
  if (years > 5) {
    throw new Error("Date range cannot exceed 5 years");
  }

  const data = await runInTransaction((session) =>
    getBookingHistoryService(startDate, endDate, session)
  );
  return c.json({
    status: 200,
    data,
    message: "Booking history fetched.",
  });
};