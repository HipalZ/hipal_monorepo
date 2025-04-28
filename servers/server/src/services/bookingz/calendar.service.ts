import type { ClientSession } from "mongoose";
import dayjs from "dayjs";
import { BookingModel, BookingBusinessModel, BusinessDayConfigModel, parseTimeToMinutes } from "@hi/db-models";
import { buildSlots, defaultPeriodRange, derivePeriod } from "./booking.utils";

// all future 60 days info
export async function getCalendarService(
  businessId: string,
  session: ClientSession
) {
  const start = dayjs().startOf("day");
  const out: {
    date: string;
    day: number;
    numOfBookings: number;
    explicitlyEdited: boolean;
  }[] = [];
  for (let i = 0; i < 60; i++) {
    const d = start.add(i, "day");
    const iso = d.format("YYYY-MM-DD");
    const dt = d.toDate();
    const numOfBookings = await BookingModel.countDocuments({
      businessId,
      bookingDate: dt,
      archived_at: null
    }).session(session);
    const edited = await BookingBusinessModel.exists({
      businessId,
      date: dt,
      explicitlyEdited: true
    }).session(session);
    out.push({ date: iso, day: d.day(), numOfBookings, explicitlyEdited: Boolean(edited) });
  }
  return out;
}

// getDateInfo
export async function getDateInfoService(
  businessId: string,
  date: Date,
  session: ClientSession
) {
  const dateStr = dayjs(date).format("YYYY-MM-DD");
  const dayStart = dayjs(dateStr).startOf("day");
  const dayEnd = dayStart.add(1, "day");
  const ledgerDate = new Date(`${dateStr}T18:30:00.000Z`);

  const ledgers = await BookingBusinessModel.find({ businessId, date: ledgerDate }).session(session);
  const dow = dayStart.day();
  const detailed: any[] = [];

  for (const row of ledgers) {
    const numOfBookings = await BookingModel.countDocuments({
      businessId: row.businessId,
      period: row.period,
      bookingDate: { $gte: dayStart.toDate(), $lt: dayEnd.toDate() },
      status: { $nin: ["cancelled", "expired"] },
    }).session(session);

    const dayCfg = await BusinessDayConfigModel.findOne({
      businessId: row.businessId,
      dayOfWeek: dow,
    })
      .session(session)
      .select("startTime endTime closedIntervals")
      .lean<{ startTime: string; endTime: string; closedIntervals: { startTime: string; endTime: string }[] }>();

    let { start: pStart, end: pEnd } = defaultPeriodRange(row.period);
    if (dayCfg) {
      if (parseTimeToMinutes(dayCfg.startTime) > parseTimeToMinutes(pStart)) {
        pStart = dayCfg.startTime;
      }
      if (parseTimeToMinutes(dayCfg.endTime) < parseTimeToMinutes(pEnd)) {
        pEnd = dayCfg.endTime;
      }
    }

    const allowedSlots = (() => {
      const base = buildSlots(pStart, pEnd);
      if (!dayCfg?.closedIntervals?.length) {
        return base;
      }
      return base.filter(s => {
        const sm = parseTimeToMinutes(s);
        return !dayCfg.closedIntervals.some(ci => {
          const ciStart = parseTimeToMinutes(ci.startTime);
          const ciEnd = parseTimeToMinutes(ci.endTime);
          return sm >= ciStart && sm < ciEnd;
        });
      });
    })();

    const agg = await BookingModel.aggregate([
      { $match: {
          businessId: row.businessId,
          period: row.period,
          bookingDate: { $gte: dayStart.toDate(), $lt: dayEnd.toDate() },
          status: { $nin: ["cancelled", "expired"] },
        }
      },
      { $group: { _id: "$slot", count: { $sum: 1 } } },
    ]).session(session);

    const slotCounts: Record<string, number> = {};
    const bookedSlots: string[] = [];
    for (const { _id, count } of agg) {
      slotCounts[_id] = count;
      bookedSlots.push(_id);
    }

    const slotSet = new Set<string>([...allowedSlots, ...bookedSlots]);
    const slots = Array.from(slotSet).sort((a, b) =>
      parseTimeToMinutes(a) - parseTimeToMinutes(b)
    );

    detailed.push({
      bookingBusiness: row,
      numOfBookings,
      slots: slots.map(s => ({
        slot: s,
        count: slotCounts[s] ?? 0,
        isInOperatableRange: allowedSlots.includes(s),
      })),
    });
  }

  const allBookings = await BookingModel.find({
    businessId,
    bookingDate: { $gte: dayStart.toDate(), $lt: dayEnd.toDate() },
    status: { $nin: ["cancelled", "expired"] },
  })
    .session(session)
    .sort({ createdAt: -1 })
    .lean();

  const dayBookings: Record<0|1|2|3, any[]> = { 0: [], 1: [], 2: [], 3: [] };
  for (const b of allBookings) {
    dayBookings[b.period as 0|1|2|3].push(b);
  }

  return {
    date: dateStr,
    bookingBusinessDetails: detailed,
    summary: {
      totalBookingsOfDay: allBookings.length,
      dayBookings,
    },
  };
}

export async function getBookingsService(
  businessId: string,
  date: Date,
  slot: string,
  session: ClientSession
) {
  // 1) figure out the period number from the slot
  const period = derivePeriod(slot); 

  // 2) load day config to clamp
  const dateStr = dayjs(date).format("YYYY-MM-DD");
  const dow = dayjs(dateStr).day();
  const dayCfg = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek: dow,
  })
    .session(session)
    .select("startTime endTime closedIntervals")
    .lean<{
      startTime: string;
      endTime: string;
      closedIntervals: { startTime: string; endTime: string }[];
    }>();

  // 3) compute the raw period window
  let { start: pStart, end: pEnd } = defaultPeriodRange(period);

  // clamp to dayCfg if present
  if (dayCfg) {
    if (parseTimeToMinutes(dayCfg.startTime) > parseTimeToMinutes(pStart)) {
      pStart = dayCfg.startTime;
    }
    if (parseTimeToMinutes(dayCfg.endTime) < parseTimeToMinutes(pEnd)) {
      pEnd = dayCfg.endTime;
    }
  }

  // 4) determine if this slot is in-operatable
  const sm = parseTimeToMinutes(slot);
  const inRange =
    sm >= parseTimeToMinutes(pStart) &&
    sm < parseTimeToMinutes(pEnd) &&
    !dayCfg?.closedIntervals.some(ci => {
      const ciStart = parseTimeToMinutes(ci.startTime);
      const ciEnd = parseTimeToMinutes(ci.endTime);
      return sm >= ciStart && sm < ciEnd;
    });

  // 5) fetch the bookings
  const start = dayjs(dateStr).startOf("day").toDate();
  const end = dayjs(dateStr).add(1, "day").toDate();
  const bookings = await BookingModel.find({
    businessId,
    slot,
    bookingDate: { $gte: start, $lt: end },
  })
    .session(session)
    .sort({ createdAt: -1 })
    .lean();

  // 6) return both the flag and the list
  return {
    isInOperatableRange: inRange,
    bookings,
  };
}


// Lean type for a booking document
interface BookingLean {
  _id: { toString(): string };
  bookingDate: Date;
  numberOfGuests: number;
  bookingBill: number;
  coupon?: { couponId: string };
}

// What each day’s entry will look like
export interface BookingHistoryEntry {
  date: string;
  numberOfGuests: number;
  totalBaseChange: number;
  bookings: string[];
  couponUsage: Record<string, number>;
}

// Overall span summary
export interface BookingHistorySummary {
  numberOfGuests: number;
  totalBaseChange: number;
  couponUsage: Record<string, number>;
}

export async function getBookingHistoryService(
  startDate: Date,
  endDate: Date,
  session: ClientSession
): Promise<{
  daily: BookingHistoryEntry[];
  summary: BookingHistorySummary;
}> {
  const spanStart = dayjs(startDate).startOf("day");
  const spanEnd = dayjs(endDate).startOf("day").add(1, "day");

  // 1) Fetch only paid bookings in the date range
  const all: BookingLean[] = await BookingModel.find({
    bookingDate: { $gte: spanStart.toDate(), $lt: spanEnd.toDate() },
    isPaid: true,
  })
    .session(session)
    .lean<BookingLean>();

  // 2) Group them by YYYY-MM-DD
  const byDate = new Map<string, BookingLean[]>();
  for (const b of all) {
    const key = dayjs(b.bookingDate).format("YYYY-MM-DD");
    const arr = byDate.get(key) ?? [];
    arr.push(b);
    byDate.set(key, arr);
  }

  // 3) Build the daily array, one entry per day in the span
  const daily: BookingHistoryEntry[] = [];
  for (
    let d = spanStart.clone();
    d.isBefore(spanEnd);
    d = d.add(1, "day")
  ) {
    const key = d.format("YYYY-MM-DD");
    const bookings = byDate.get(key) ?? [];

    const numberOfGuests = bookings.reduce(
      (sum: number, b: BookingLean): number => sum + b.numberOfGuests,
      0
    );
    const totalBaseChange = bookings.reduce(
      (sum: number, b: BookingLean): number => sum + b.bookingBill,
      0
    );

    const couponUsage: Record<string, number> = {};
    for (const b of bookings) {
      if (b.coupon?.couponId) {
        couponUsage[b.coupon.couponId] =
          (couponUsage[b.coupon.couponId] || 0) + 1;
      }
    }

    daily.push({
      date: key,
      numberOfGuests,
      totalBaseChange,
      bookings: bookings.map((b) => b._id.toString()),
      couponUsage,
    });
  }

  // 4) Compute the overall summary
  const summaryNumberOfGuests = all.reduce(
    (sum: number, b: BookingLean): number => sum + b.numberOfGuests,
    0
  );
  const summaryTotalBaseChange = all.reduce(
    (sum: number, b: BookingLean): number => sum + b.bookingBill,
    0
  );
  const summaryCouponUsage: Record<string, number> = {};
  for (const b of all) {
    if (b.coupon?.couponId) {
      summaryCouponUsage[b.coupon.couponId] =
        (summaryCouponUsage[b.coupon.couponId] || 0) + 1;
    }
  }

  return {
    daily,
    summary: {
      numberOfGuests: summaryNumberOfGuests,
      totalBaseChange: summaryTotalBaseChange,
      couponUsage: summaryCouponUsage,
    },
  };
}