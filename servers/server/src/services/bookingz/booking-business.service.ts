import { ClientSession, Types } from "mongoose";
import dayjs from "dayjs";
import { isEqual } from "lodash";
import {
  BookingBusinessModel,
  BusinessDayConfigModel,
  BusinessPeriodConfigModel,
} from "@hi/db-models";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * deepEqual helper to compare two values using lodash.
 */
export const deepEqual = (a: any, b: any): boolean => isEqual(a, b);

/**
 * CouponAllocInput defines the shape of the input for a coupon allocation.
 * It includes a couponId (as a string or an ObjectId) and a numeric remaining value.
 */
export type CouponAllocInput = {
  couponId: string | Types.ObjectId;
  remaining: number;
};

/* Utility: generateUniqueVersionId returns a new unique version id */
const generateUniqueVersionId = (): string =>
  new Types.ObjectId().toHexString();

/**
 * upsertBookingBusiness
 *
 * - Finds an existing BookingBusiness record (for a given business, date, and period) or creates a new one.
 * - Maps each allocation from the provided array:
 *    - For each allocation in `alloc`, it converts couponId to a Types.ObjectId.
 *    - It always generates a new versionId for each allocation in this function.
 *      (Note: the preservation of versionId when no changes occur is handled in innerUpsert.)
 * - If the flag `edited` is true, it marks the record as explicitly edited.
 * - Finally, it saves the record and returns it.
 */
export const upsertBookingBusiness = async (
  businessId: string,
  date: Date,
  period: number,
  alloc: CouponAllocInput[] = [],
  edited: boolean,
  session: ClientSession,
) => {
  // Normalize date to midnight local timezone (Asia/Kolkata)
  const normalizedDate = dayjs.tz(date, "Asia/Kolkata").startOf("day").toDate();

  const row =
    (await BookingBusinessModel.findOne({
      businessId,
      date: normalizedDate,
      period,
    }).session(session)) ||
    new BookingBusinessModel({
      businessId,
      date: normalizedDate,
      period,
      couponsRemaining: [],
    });

  row.couponsRemaining = alloc
    .filter((a) => a && a.couponId)
    .map((a) => ({
      couponId: new Types.ObjectId(a.couponId.toString()),
      remaining: a.remaining,
      versionId: generateUniqueVersionId(),
    }));

  if (edited) row.explicitlyEdited = true;

  await row.save({ session });

  return row;
};

export const explicitUpsertBookingBusinessService = async (
  businessId: string,
  dateStr: string,
  period: number,
  alloc: CouponAllocInput[],
  session: ClientSession,
) => {
  const date = dayjs.utc(dateStr, "YYYY-MM-DD").startOf("day").toDate();

  // Call your existing function with `edited` flag set to true.
  return upsertBookingBusiness(
    businessId,
    date,
    period,
    alloc,
    true, // explicitly edited
    session,
  );
};

/**
 * fetchOrUpsertBookingBusiness
 *
 * - Retrieves the current desired allocation for the given business, date, and period
 *   by reading the BusinessPeriodConfig.
 * - Maps the stored coupon allocations into CouponAllocInput shape (couponId as a string, remaining).
 * - Calls upsertBookingBusiness with that data.
 */
export const fetchOrUpsertBookingBusiness = async (
  businessId: string,
  date: Date,
  period: number,
  session: ClientSession,
) => {
  const dayCfg = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek: dayjs(date).day(),
  }).session(session);
  if (!dayCfg) throw new Error("Day config not found");

  const perCfg = await BusinessPeriodConfigModel.findOne({
    businessDayConfigId: dayCfg._id,
    period,
  }).session(session);

  const desired: CouponAllocInput[] = perCfg
    ? perCfg.couponAllocations.map((x: any) => ({
        couponId: x.couponId.toString(),
        remaining: x.remaining,
      }))
    : [];
  return upsertBookingBusiness(
    businessId,
    date,
    period,
    desired,
    false,
    session,
  );
};

/**
 * ensureBookingBusiness synchronizes the 60-day ledger.
 *
 * It works in two modes:
 * 1. Full seed mode, when the impacted array is empty:
 *    - Iterates over every day in the next 60 days.
 *    - For each day that is open (found via BusinessDayConfig), updates all four periods.
 * 2. Targeted mode, when the impacted array is provided:
 *    - For each impacted object, where the impacted object has at least a dayOfWeek,
 *      if period is provided, update that period for every matching day; if not provided, update all periods.
 *
 * innerUpsert:
 * - Finds an existing BookingBusiness record for the given date and period.
 * - Normalizes the stored coupon allocations (couponId as a string, remaining).
 * - Merges the new allocation array with the stored one:
 *    - For each allocation in the new allocation array (newAlloc):
 *       - If the record exists, finds if there is a matching allocation (by couponId).
 *       - If found and the remaining count is the same, preserves the existing versionId.
 *       - Otherwise, generates a new versionId.
 * - If there is no record, creates a new one.
 */
export const ensureBookingBusiness = async (
  businessId: string,
  impacted: {
    dayOfWeek: number; // 0–6
    period?: number; // 0–3 (required if newAlloc is present)
    newAlloc?: CouponAllocInput[]; // Only allowed when period is specified.
  }[] = [],
  session: ClientSession,
) => {
  // Validate impacted array.
  for (const it of impacted) {
    const periodGiven = typeof it.period === "number";
    const allocGiven = Array.isArray(it.newAlloc);
    if (allocGiven && !periodGiven)
      throw new Error("If newAlloc is supplied, period must be specified");
    if (!allocGiven && periodGiven)
      throw new Error("If period is supplied, newAlloc must be supplied");
  }

  // Define the 60-day window.
  const start = dayjs().startOf("day");
  const end = start.clone().add(60, "day");

  /* ── 1. Build target map ───────────────────────────────── */
  // The targets map uses a key of "dayOfWeek-period" and holds an object with the period and optional alloc.
  const targets = new Map<
    string,
    { period: 0 | 1 | 2 | 3; alloc?: CouponAllocInput[] }
  >();

  if (impacted.length === 0) {
    // Full seed – update all 7 days and 4 periods.
    for (let d = 0 as 0 | 1 | 2 | 3 | 4 | 5 | 6; d < 7; d++)
      for (let p = 0 as 0 | 1 | 2 | 3; p < 4; p++)
        targets.set(`${d}-${p}`, { period: p });
  } else {
    for (const it of impacted) {
      if (it.newAlloc) {
        // Specific period update.
        targets.set(`${it.dayOfWeek}-${it.period}`, {
          period: it.period as 0 | 1 | 2 | 3,
          alloc: it.newAlloc,
        });
      } else {
        // Day-wide resync (no custom alloc) – apply to all periods for that day.
        for (let p = 0 as 0 | 1 | 2 | 3; p < 4; p++)
          targets.set(`${it.dayOfWeek}-${p}`, { period: p });
      }
    }
  }

  const targetDows = [
    ...new Set([...targets.keys()].map((k) => +k.split("-")[0])),
  ];
  const targetPeriods = [
    ...new Set([...targets.values()].map((v) => v.period)),
  ];

  /* ── 2. Bulk reads ───────────────────────────────────────── */
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

  // Build a lookup map for period configs.
  const perCfgByDayPeriod = new Map<string, any>();
  for (const pc of perCfgs)
    perCfgByDayPeriod.set(`${pc.businessDayConfigId}-${pc.period}`, pc);

  // Fetch existing booking ledger rows (that are not explicitly edited).
  const existingRows = await BookingBusinessModel.find({
    businessId,
    explicitlyEdited: false,
    date: { $gte: start.toDate(), $lt: end.toDate() },
    period: { $in: targetPeriods },
  }).session(session);

  // Build a lookup using UTC-formatted date to avoid timezone issues.
  const existingByDatePeriod = new Map<string, any>();
  for (const row of existingRows)
    existingByDatePeriod.set(
      `${dayjs(row.date).utc().format("YYYY-MM-DD")}-${row.period}`,
      row,
    );

  /* ── 3. Build bulkWrite operations ───────────────────────── */
  const upserts: any[] = [];

  // Loop over the 60-day window.
  for (let d = start.clone(); d.isBefore(end); d = d.add(1, "day")) {
    const dow = d.day();
    // Find the corresponding day config. Skip if not open.
    const dayCfg = dayCfgs.find((dc) => dc.dayOfWeek === dow);
    if (!dayCfg) continue; // day is closed.

    for (let p = 0 as 0 | 1 | 2 | 3; p < 4; p++) {
      const key = `${dow}-${p}`;
      if (!targets.has(key)) continue; // This day-period pair isn’t impacted.

      const tgt = targets.get(key)!;

      // Desired allocation:
      // If an explicit allocation was provided, use it.
      // Otherwise, fall back on the period config's allocations.
      const desired: CouponAllocInput[] =
        tgt.alloc ??
        (perCfgByDayPeriod
          .get(`${dayCfg._id}-${p}`)
          ?.couponAllocations.map((x: any) => ({
            couponId: x.couponId.toString(),
            remaining: x.remaining,
          })) ||
          []);

      // Build a key for existing row lookup using UTC to match the above.
      const rowKey = `${d.utc().format("YYYY-MM-DD")}-${p}`;
      const prevRow = existingByDatePeriod.get(rowKey);

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

      // Merge desired allocation with the previous row.
      // Keep old versionId if coupon exists and 'remaining' remains the same; otherwise, generate a new versionId.
      const merged = desired.map((a) => {
        const prev = prevMap.get(a.couponId);
        const keepOld = prev && prev.remaining === a.remaining;
        return {
          couponId: new Types.ObjectId(a.couponId),
          remaining: a.remaining,
          versionId: keepOld ? prev!.versionId : generateUniqueVersionId(),
        };
      });

      upserts.push({
        updateOne: {
          filter: {
            businessId,
            date: d.startOf("day").toDate(), // store with local midnight (or adjust to UTC as needed)
            period: p,
            explicitlyEdited: false,
          },
          update: { $set: { couponsRemaining: merged } },
          upsert: true,
        },
      });
    }
  }

  /* ── 4. Apply updates in a single bulkWrite ─────────────── */
  if (upserts.length) {
    await BookingBusinessModel.bulkWrite(upserts, { session });
  }
};
