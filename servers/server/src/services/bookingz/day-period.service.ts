import { ClientSession, Types } from "mongoose";
import {
  BusinessDayConfigModel,
  BusinessPeriodConfigModel,
} from "@hi/db-models";
import { ensureBookingBusiness } from "./booking-business.service";

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
  let dayCfg =
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
  if (payload.baseCharge !== undefined) pCfg.baseCharge = payload.baseCharge;
  if (payload.redeemableCoverCharge !== undefined)
    pCfg.redeemableCoverCharge = payload.redeemableCoverCharge;
  if (payload.isOpen !== undefined) pCfg.isOpen = payload.isOpen;

  if (payload.couponAllocations !== undefined) {
    pCfg.couponAllocations = payload.couponAllocations.map((c) => ({
      couponId: new Types.ObjectId(c.couponId),
      remaining: c.remaining,
    }));
  }

  await pCfg.save({ session });

  /* ── 4. trigger ledger refresh for this (dow, period) ─────── */
  console.log("this ran with", {
    businessId,
    dayOfWeek,
    period,
    newAlloc: pCfg.couponAllocations.map((x: any) => ({
      couponId: x.couponId.toString(),
      remaining: x.remaining,
    })),
  });
  await ensureBookingBusiness(
    businessId,
    [
      {
        dayOfWeek,
        period,
        newAlloc: pCfg.couponAllocations.map((x: any) => ({
          couponId: x.couponId.toString(),
          remaining: x.remaining,
        })),
      },
    ],
    session,
  );

  return pCfg;
};
