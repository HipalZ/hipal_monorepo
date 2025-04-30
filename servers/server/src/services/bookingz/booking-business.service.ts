import type { ClientSession } from "mongoose";
import { Types as mongooseTypes } from "mongoose";
import dayjs from "dayjs";
import {
  BookingBusinessModel,
  BusinessDayConfigModel,
  BusinessPeriodConfigModel,
} from "@hi/db-models";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { CouponAllocInput } from "@hi/db-models/src/models/bookingz/business-period-config";
import { generateUniqueVersionId } from "./booking.utils";

dayjs.extend(utc);
dayjs.extend(timezone);

export const explicitUpsertBookingBusinessService = async (
  businessId: string,
  dateParam: Date, // midnight local
  period: number,
  { alloc, isOpen }: { alloc?: CouponAllocInput[]; isOpen?: boolean },
  session: ClientSession,
) => {
  const year = dateParam.getFullYear();
  const month = String(dateParam.getMonth() + 1).padStart(2, "0");
  const day = String(dateParam.getDate()).padStart(2, "0");

  // EXACTLY this UTC timestamp every time:
  const storedDate = new Date(`${year}-${month}-${day}T18:30:00.000Z`);

  const row =
    (await BookingBusinessModel.findOne({
      businessId,
      date: storedDate,
      period,
    }).session(session)) ||
    new BookingBusinessModel({ businessId, date: storedDate, period });

  if (alloc !== undefined) {
    row.couponsRemaining = alloc.map((a) => ({
      couponId: a.couponId,
      remaining: a.remaining,
      versionId: generateUniqueVersionId(),
    }));
    row.explicitlyEdited = true;
  }

  if (typeof isOpen === "boolean") {
    row.isOpen = isOpen;
    row.explicitlyEdited = true;
  }

  await row.save({ session });
  return row;
};

export const upsertBookingBusiness = async (
  businessId: string,
  date: Date,
  period: number,
  { alloc, isOpen }: { alloc?: CouponAllocInput[]; isOpen?: boolean },
  session: ClientSession,
) => {
  const normalizedDate = date; // no further adjustments

  const row =
    (await BookingBusinessModel.findOne({
      businessId,
      date: normalizedDate,
      period,
    }).session(session)) ||
    new BookingBusinessModel({ businessId, date: normalizedDate, period });

  if (alloc !== undefined) {
    row.couponsRemaining = alloc.map((a) => ({
      couponId: a.couponId,
      remaining: a.remaining,
      versionId: generateUniqueVersionId(),
    }));
    row.explicitlyEdited = true;
  }

  if (typeof isOpen === "boolean") {
    row.isOpen = isOpen;
    row.explicitlyEdited = true;
  }

  await row.save({ session });
  return row;
};

export const fetchOrUpsertBookingBusiness = async (
  businessId: string,
  date: Date,
  period: number,
  session: ClientSession,
) => {
  // 1) find the day-config
  const dayCfg = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek: dayjs(date).day(),
  }).session(session);
  if (!dayCfg) throw new Error("Day config not found");

  // 2) fetch period-config
  const perCfg = await BusinessPeriodConfigModel.findOne({
    businessDayConfigId: dayCfg._id,
    period,
  }).session(session);

  // 3) prepare desired allocations
  const desired: CouponAllocInput[] = perCfg
    ? perCfg.couponAllocations.map((x: any) => ({
        couponId: x.couponId.toString(),
        remaining: x.remaining,
      }))
    : [];

  // 4) normalize to YYYY-MM-DD, then to 18:30Z
  const isoDate = date.toISOString().slice(0, 10); // "2025-04-27"
  const normalizedDate = new Date(`${isoDate}T18:30:00.000Z`);

  return upsertBookingBusiness(
    businessId,
    normalizedDate,
    period,
    { alloc: desired },
    session,
  );
};

export const ensureBookingBusiness = async (
  businessId: string,
  impacted: {
    dayOfWeek: number; // 0–6
    period?: number; // 0–3 (required if newAlloc is present)
    newAlloc?: CouponAllocInput[];
  }[] = [],
  session: ClientSession,
) => {
  // 0) Validate impacted array
  for (const it of impacted) {
    const hasPeriod = typeof it.period === "number";
    const hasAlloc = Array.isArray(it.newAlloc);
    if (hasAlloc && !hasPeriod) {
      throw new Error("If newAlloc is supplied, period must be specified");
    }
    if (!hasAlloc && hasPeriod) {
      throw new Error("If period is supplied, newAlloc must be supplied");
    }
  }

  // 1) Define the 60-day window
  const start = dayjs().startOf("day");
  const end = start.clone().add(60, "day");

  // 2) Build targets map
  const targets = new Map<
    string,
    { period: 0 | 1 | 2 | 3; alloc?: CouponAllocInput[] }
  >();
  if (impacted.length === 0) {
    for (let d = 0 as 0 | 1 | 2 | 3 | 4 | 5 | 6; d < 7; d++) {
      for (let p = 0 as 0 | 1 | 2 | 3; p < 4; p++) {
        targets.set(`${d}-${p}`, { period: p });
      }
    }
  } else {
    for (const it of impacted) {
      if (it.newAlloc) {
        targets.set(`${it.dayOfWeek}-${it.period}`, {
          period: it.period as 0 | 1 | 2 | 3,
          alloc: it.newAlloc,
        });
      } else {
        for (let p = 0 as 0 | 1 | 2 | 3; p < 4; p++) {
          targets.set(`${it.dayOfWeek}-${p}`, { period: p });
        }
      }
    }
  }

  const targetDows = Array.from(
    new Set([...targets.keys()].map((k) => +k.split("-")[0])),
  );
  const targetPeriods = Array.from(
    new Set([...targets.values()].map((v) => v.period)),
  );

  // 3) Read configs
  const dayCfgs = await BusinessDayConfigModel.find({
    businessId,
    dayOfWeek: { $in: targetDows },
    isOpen: true,
  }).session(session);

  const perCfgs = await BusinessPeriodConfigModel.find({
    businessDayConfigId: { $in: dayCfgs.map((d) => d._id) },
    period: { $in: targetPeriods },
    isOpen: true,
  }).session(session);

  const perCfgByDayPeriod = new Map<string, any>();
  for (const pc of perCfgs) {
    perCfgByDayPeriod.set(`${pc.businessDayConfigId}-${pc.period}`, pc);
  }

  // 4) Fetch existing ledger rows
  const existingRows = await BookingBusinessModel.find({
    businessId,
    explicitlyEdited: false,
    date: { $gte: start.toDate(), $lt: end.toDate() },
    period: { $in: targetPeriods },
  }).session(session);

  // 5) Build lookup by exact ISO timestamp + period
  const existingByKey = new Map<string, any>();
  for (const row of existingRows) {
    const iso = row.date.toISOString(); // e.g. "2025-05-06T18:30:00.000Z"
    existingByKey.set(`${iso}-${row.period}`, row);
  }

  // 6) Prepare bulkWrite operations
  const upserts: any[] = [];
  for (let d = start.clone(); d.isBefore(end); d = d.add(1, "day")) {
    const dow = d.day();
    const dayCfg = dayCfgs.find((dc) => dc.dayOfWeek === dow);
    if (!dayCfg) continue; // closed day

    for (let p = 0 as 0 | 1 | 2 | 3; p < 4; p++) {
      const tgt = targets.get(`${dow}-${p}`);
      if (!tgt) continue;

      const isoDate = d.format("YYYY-MM-DD");
      const isoString = `${isoDate}T18:30:00.000Z`;
      const rowKey = `${isoString}-${p}`;
      const prevRow = existingByKey.get(rowKey);

      const desired: CouponAllocInput[] =
        tgt.alloc ??
        (perCfgByDayPeriod
          .get(`${dayCfg._id}-${p}`)
          ?.couponAllocations.map((x: any) => ({
            couponId: x.couponId.toString(),
            remaining: x.remaining,
          })) ||
          []);

      const prevMap = new Map<
        string,
        { remaining: number; versionId: string }
      >();
      if (prevRow) {
        for (const x of prevRow.couponsRemaining) {
          prevMap.set(x.couponId.toString(), {
            remaining: x.remaining,
            versionId: x.versionId,
          });
        }
      }

      const merged = desired.map((a) => {
        const prev = prevMap.get(a.couponId);
        const keep = prev && prev.remaining === a.remaining;
        return {
          couponId: new mongooseTypes.ObjectId(a.couponId),
          remaining: a.remaining,
          versionId: keep ? prev!.versionId : generateUniqueVersionId(),
        };
      });

      upserts.push({
        updateOne: {
          filter: {
            businessId,
            date: new Date(isoString),
            period: p,
            explicitlyEdited: false,
          },
          update: {
            $set: { couponsRemaining: merged },
            $setOnInsert: { isOpen: true },
          },
          upsert: true,
        },
      });
    }
  }

  // 7) Execute bulkWrite if needed
  if (upserts.length) {
    await BookingBusinessModel.bulkWrite(upserts, { session });
  }
};
