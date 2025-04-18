import type { ClientSession, Types } from "mongoose";
import { Types as mongooseTypes } from "mongoose";
import {
  BusinessDayConfigModel,
  BusinessPeriodConfigModel,
  Couponz,
} from "@hi/db-models";
import { ensureBookingBusiness } from "./booking-business.service";
import type {
  BulkPeriodUpdate,
  CouponAllocInput,
} from "@hi/db-models/src/models/bookingz/business-period-config";

/* Helper: default period range */
const defaultPeriodRange = (p: number) => {
  switch (p) {
    case 0:
      return { start: "04:00", end: "12:00" };
    case 1:
      return { start: "12:00", end: "16:00" };
    case 2:
      return { start: "16:00", end: "19:00" };
    case 3:
      return { start: "19:00", end: "28:00" };
    default:
      throw new Error("Invalid period");
  }
};

/* upsertDayConfig */
export const upsertDayConfig = async (
  businessId: string,
  dow: number,
  start: string,
  end: string,
  closedIntervals: { startTime: string; endTime: string }[],
  isOpen = true,
  session: ClientSession,
) => {
  const dayCfg =
    (await BusinessDayConfigModel.findOne({
      businessId,
      dayOfWeek: dow,
    }).session(session)) ||
    new BusinessDayConfigModel({ businessId, dayOfWeek: dow });

  dayCfg.startTime = start;
  dayCfg.endTime = end;
  dayCfg.closedIntervals = closedIntervals;
  dayCfg.isOpen = isOpen;
  await dayCfg.save({ session });

  /* cascade to periods */
  await updatePeriodConfigsForDay(
    businessId,
    dow,
    (pCfg) => {
      const rng = defaultPeriodRange(pCfg.period);
      const outOfWindow =
        rng.start < start ||
        rng.end > end ||
        closedIntervals.some(
          (ci) => ci.startTime <= rng.start && ci.endTime >= rng.end,
        );
      if (outOfWindow) pCfg.isOpen = false;
    },
    session,
  );

  const impacted = [{ dayOfWeek: dow }];
  await ensureBookingBusiness(businessId, impacted, session);
  return dayCfg;
};

/* updatePeriodConfigsForDay */
export const updatePeriodConfigsForDay = async (
  businessId: string,
  dow: number,
  mutator: (pCfg: any) => void,
  session: ClientSession,
) => {
  const dayCfg = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek: dow,
  }).session(session);
  if (!dayCfg) return;
  const pCfgs = await BusinessPeriodConfigModel.find({
    businessDayConfigId: dayCfg._id,
  }).session(session);
  for (const pCfg of pCfgs) {
    mutator(pCfg);
    await pCfg.save({ session });
  }
};

/* toggleDayConfigIsOpen */
export const toggleDayConfigIsOpen = async (
  businessId: string,
  dow: number,
  session: ClientSession,
) => {
  const cfg = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek: dow,
  }).session(session);
  if (!cfg) throw new Error("DayConfig not found");
  cfg.isOpen = !cfg.isOpen;
  await cfg.save({ session });

  if (!cfg.isOpen) {
    await updatePeriodConfigsForDay(
      businessId,
      dow,
      (p) => {
        p.isOpen = false;
      },
      session,
    );
  }
  await ensureBookingBusiness(businessId, [{ dayOfWeek: dow }], session);
  return cfg;
};

/* togglePeriodConfigIsOpen */
export const togglePeriodConfigIsOpen = async (
  businessId: string,
  dow: number,
  period: number,
  session: ClientSession,
) => {
  const dayCfg = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek: dow,
  }).session(session);
  if (!dayCfg) throw new Error("DayConfig not found");

  const pCfg = await BusinessPeriodConfigModel.findOne({
    businessDayConfigId: dayCfg._id,
    period,
  }).session(session);
  if (!pCfg) throw new Error("PeriodConfig not found");

  pCfg.isOpen = !pCfg.isOpen;
  await pCfg.save({ session });

  const impacted = [
    {
      dayOfWeek: dow,
      period,
      newAlloc: pCfg.isOpen ? pCfg.couponAllocations : [],
    },
  ];
  await ensureBookingBusiness(businessId, impacted, session);
  return pCfg;
};

export const fetchBusinessDaysService = async (
  businessId: string,
  session: ClientSession,
) => {
  return BusinessDayConfigModel.find({ businessId }).session(session);
};

export const getPeriodsForDayService = async (
  businessId: string,
  dayOfWeek: number,
  session: ClientSession,
) => {
  // Find the business day configuration for the given business and day
  const businessDay = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek,
  }).session(session);
  if (!businessDay) {
    throw new Error("Business day configuration not found");
  }

  // Now retrieve and return all period configurations associated with that business day.
  const periods = await BusinessPeriodConfigModel.find({
    businessDayConfigId: businessDay._id,
  }).session(session);
  return periods;
};

type PeriodDoc = {
  businessDayConfigId: mongooseTypes.ObjectId;
  dayOfWeek: number;
  period: number;
  baseCharge: number;
  redeemableCoverCharge: number;
  isOpen: boolean;
  archived_at: Date | null;
  couponAllocations: any[];
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
};

export const getFilteredPeriodConfigsService = async (
  businessId: string,
  days: number[] | undefined,
  periods: number[] | undefined,
  session: ClientSession,
) => {
  const bizId = new mongooseTypes.ObjectId(businessId);

  // 1. fetch day configs, filter by days if provided
  const dayFilter: any = { businessId: bizId };
  if (Array.isArray(days) && days.length) dayFilter.dayOfWeek = { $in: days };
  const dayCfgs = await BusinessDayConfigModel.find(dayFilter)
    .session(session)
    .select("_id dayOfWeek")
    .lean<{ _id: mongooseTypes.ObjectId; dayOfWeek: number }[]>();

  if (!dayCfgs.length) {
    return { dayWise: {}, periodWise: {} };
  }

  // build a map: dayConfigId → dayOfWeek
  const dayOfWeekMap = new Map<string, number>();
  for (const d of dayCfgs) {
    dayOfWeekMap.set(d._id.toString(), d.dayOfWeek);
  }

  // 2. fetch period configs under those dayCfg IDs, filter by periods if provided
  const perFilter: any = {
    businessDayConfigId: { $in: dayCfgs.map((d) => d._id) },
  };
  if (Array.isArray(periods) && periods.length) {
    perFilter.period = { $in: periods };
  }
  const configs = await BusinessPeriodConfigModel.find(perFilter)
    .session(session)
    .lean<PeriodDoc[]>();

  // 3. reshape into dayWise and periodWise
  const dayWise: Record<number, Record<number, PeriodDoc>> = {};
  const periodWise: Record<number, Record<number, PeriodDoc>> = {};

  for (const cfg of configs) {
    const key = cfg.businessDayConfigId.toString();
    const d = dayOfWeekMap.get(key);
    if (d === undefined) continue; // shouldn't happen

    const p = cfg.period;

    if (!dayWise[d]) dayWise[d] = {};
    dayWise[d][p] = cfg;

    if (!periodWise[p]) periodWise[p] = {};
    periodWise[p][d] = cfg;
  }

  return { dayWise, periodWise };
};
// upsertPeriodConfig

type UpsertPayload = {
  baseCharge?: number;
  redeemableCoverCharge?: number;
  couponAllocations?: { couponId: string; remaining: number }[];
  isOpen?: boolean;
};

export const upsertPeriodConfigService = async (
  businessId: string,
  dayOfWeek: number,
  period: number,
  payload: UpsertPayload,
  session: ClientSession,
) => {
  /* ── 1. locate the BusinessDayConfig ─────────────────────── */
  const dayCfg = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek,
  }).session(session);
  if (!dayCfg) throw new Error("Business day configuration not found");

  /* ── 2. find‑or‑create the BusinessPeriodConfig ───────────── */
  const pCfg =
    (await BusinessPeriodConfigModel.findOne({
      businessDayConfigId: dayCfg._id,
      period,
    }).session(session)) ||
    new BusinessPeriodConfigModel({
      businessDayConfigId: dayCfg._id,
      period,
    });

  /* ── 3. apply incoming fields (only if provided) ──────────── */
  if (payload.baseCharge !== undefined) {
    pCfg.baseCharge = payload.baseCharge;
  }
  if (payload.redeemableCoverCharge !== undefined) {
    pCfg.redeemableCoverCharge = payload.redeemableCoverCharge;
  }
  if (payload.isOpen !== undefined) {
    pCfg.isOpen = payload.isOpen;
  }

  if (payload.couponAllocations !== undefined) {
    // Extract all couponIds from payload
    const couponIds = payload.couponAllocations.map(
      (c) => new mongooseTypes.ObjectId(c.couponId),
    );

    // Fetch all matching coupons that are active BOOKINGS type
    const validCoupons = await Couponz.find({
      _id: { $in: couponIds },
      isDeleted: false,
      type: "BOOKINGS",
    })
      .session(session)
      .select("_id");

    // If any couponId is missing or not of the right type, reject
    if (validCoupons.length !== couponIds.length) {
      // figure out which ones are invalid
      const validIdStrings = new Set(validCoupons.map((c) => c._id.toString()));
      const invalid = couponIds
        .map((id) => id.toString())
        .filter((id) => !validIdStrings.has(id));
      throw new Error(
        `Invalid coupon allocations: the following couponIds are either deleted or not of type BOOKINGS: ${invalid.join(
          ", ",
        )}`,
      );
    }

    // All good — map into the schema
    pCfg.couponAllocations = payload.couponAllocations.map((c) => ({
      couponId: new mongooseTypes.ObjectId(c.couponId),
      remaining: c.remaining,
    }));
  }

  await pCfg.save({ session });

  /* ── 4. trigger ledger refresh for this (dow, period) ─────── */
  await ensureBookingBusiness(
    businessId,
    [
      {
        dayOfWeek,
        period,
        newAlloc: pCfg.couponAllocations.map((x) => ({
          couponId: x.couponId.toString(),
          remaining: x.remaining,
        })),
      },
    ],
    session,
  );

  return pCfg;
};

export const bulkUpdatePeriodsService = async (
  businessId: string,
  items: BulkPeriodUpdate[],
  session: ClientSession,
) => {
  console.log("bulkUpdatePeriodsService ▶ start", {
    businessId,
    itemsCount: items.length,
  });
  const couponCache = new Map<string, boolean>();
  const impacted: {
    dayOfWeek: number;
    period: number;
    newAlloc: CouponAllocInput[];
  }[] = [];
  const result: any[] = [];

  for (const it of items) {
    console.log("→ processing item", it);
    const dayCfg = await BusinessDayConfigModel.findOne({
      businessId,
      dayOfWeek: it.dayOfWeek,
    }).session(session);
    if (!dayCfg) {
      console.error("! day config not found for", it.dayOfWeek);
      throw new Error(`Day ${it.dayOfWeek} not found`);
    }

    const pCfg =
      (await BusinessPeriodConfigModel.findOne({
        businessDayConfigId: dayCfg._id,
        period: it.period,
      }).session(session)) ||
      new BusinessPeriodConfigModel({
        businessDayConfigId: dayCfg._id,
        period: it.period,
      });

    let changedMeta = false;
    let changedAlloc = false;

    // 1) meta fields
    if (it.baseCharge !== undefined && pCfg.baseCharge !== it.baseCharge) {
      console.log(
        "  • baseCharge changed:",
        pCfg.baseCharge,
        "→",
        it.baseCharge,
      );
      pCfg.baseCharge = it.baseCharge;
      changedMeta = true;
    }
    if (
      it.redeemableCoverCharge !== undefined &&
      pCfg.redeemableCoverCharge !== it.redeemableCoverCharge
    ) {
      console.log(
        "  • redeemableCoverCharge changed:",
        pCfg.redeemableCoverCharge,
        "→",
        it.redeemableCoverCharge,
      );
      pCfg.redeemableCoverCharge = it.redeemableCoverCharge;
      changedMeta = true;
    }
    if (it.isOpen !== undefined && pCfg.isOpen !== it.isOpen) {
      console.log("  • isOpen changed:", pCfg.isOpen, "→", it.isOpen);
      pCfg.isOpen = it.isOpen;
      changedMeta = true;
    }

    // 2) couponAllocations
    if (it.couponAllocations) {
      console.log("  • checking couponAllocations", it.couponAllocations);
      const desired: { couponId: Types.ObjectId; remaining: number }[] = [];
      for (const a of it.couponAllocations) {
        const id = a.couponId;
        if (!couponCache.has(id)) {
          const exists = await Couponz.exists({
            _id: new mongooseTypes.ObjectId(id),
            type: "BOOKINGS",
            isDeleted: false,
            businessId,
          }).session(session);
          couponCache.set(id, Boolean(exists));
        }
        if (!couponCache.get(id)) {
          console.error("!! invalid coupon", id);
          throw new Error(`Invalid coupon ${id}`);
        }
        console.log("    ✓ coupon valid", id);
        desired.push({
          couponId: new mongooseTypes.ObjectId(id),
          remaining: a.remaining,
        });
      }

      console.log(
        "    • existing allocations:",
        pCfg.couponAllocations.map((e) => ({
          id: e.couponId.toString(),
          remaining: e.remaining,
        })),
      );
      console.log(
        "    • desired allocations:",
        desired.map((d) => ({
          id: d.couponId.toString(),
          remaining: d.remaining,
        })),
      );

      const same =
        pCfg.couponAllocations.length === desired.length &&
        desired.every((d) => {
          const e = pCfg.couponAllocations.find((x) =>
            x.couponId.equals(d.couponId),
          );
          return !!e && e.remaining === d.remaining;
        });

      if (!same) {
        console.log("    • allocations differ → updating");
        pCfg.couponAllocations = desired;
        changedAlloc = true;
      } else {
        console.log("    • allocations identical → no change");
      }
    }

    // 3) save if anything changed
    if (changedMeta || changedAlloc) {
      console.log("  → saving updated period config", {
        dayOfWeek: it.dayOfWeek,
        period: it.period,
      });
      await pCfg.save({ session });
      result.push(pCfg);
    } else {
      console.log("  → no changes detected for", {
        dayOfWeek: it.dayOfWeek,
        period: it.period,
      });
    }

    // 4) only periods whose *allocations* changed get fed into ensureBookingBusiness
    if (changedAlloc) {
      impacted.push({
        dayOfWeek: it.dayOfWeek,
        period: it.period,
        newAlloc: pCfg.couponAllocations.map((x) => ({
          couponId: x.couponId.toString(),
          remaining: x.remaining,
        })),
      });
    }
  }

  if (impacted.length) {
    console.log("→ running ensureBookingBusiness with impacted:", impacted);
    await ensureBookingBusiness(businessId, impacted, session);
  } else {
    console.log("→ no coupon-alloc changes → skipping ensureBookingBusiness");
  }

  console.log("bulkUpdatePeriodsService ◀ done", {
    updatedCount: result.length,
  });
  return result;
};

export const getSinglePeriodService = async (
  businessId: string,
  dayOfWeek: number,
  period: number,
  session: ClientSession,
) => {
  // 1) ensure that the BusinessDayConfig exists
  const dayCfg = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek,
  }).session(session);
  if (!dayCfg) {
    throw new Error(
      `No day‑config for business ${businessId} on dayOfWeek=${dayOfWeek}`,
    );
  }

  // 2) fetch the specific period
  const pCfg = await BusinessPeriodConfigModel.findOne({
    businessDayConfigId: dayCfg._id,
    period,
  }).session(session);
  if (!pCfg) {
    throw new Error(
      `No period‑config for businessDayConfig ${dayCfg._id} period=${period}`,
    );
  }

  return pCfg;
};
