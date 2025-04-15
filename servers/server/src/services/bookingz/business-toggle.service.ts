import type { ClientSession } from "mongoose";

import { ensureBookingBusiness } from "./booking-business.service";
import { updatePeriodConfigsForDay } from "./day-period.service";
import {
  Business,
  BusinessDayConfigModel,
  BusinessPeriodConfigModel,
} from "@hi/db-models";
import {
  hydrateBusinessDayConfig,
  hydrateBusinessPeriodConfig,
} from "./ capacity.service";

/* setBusinessBookingActive */
export const setBusinessBookingActive = async (
  bizId: string,
  flag: boolean,
  session: ClientSession,
) => {
  // Retrieve the business using the session
  const biz = await Business.findById(bizId).session(session);
  if (!biz) throw new Error("Business not found");
  if (biz.isBookingActive === flag) return biz;

  // Use findByIdAndUpdate to update the field, bypassing document save hooks.
  const updatedBiz = await Business.findByIdAndUpdate(
    bizId,
    { isBookingActive: flag },
    { new: true, session, runValidators: true },
  );

  // If we're activating the business, seed related configurations.
  if (flag) {
    await hydrateBusinessDayConfig(bizId, session);
    await hydrateBusinessPeriodConfig(bizId, session);
    await ensureBookingBusiness(bizId, [], session);
  }

  return updatedBiz;
};

/* toggleAllDaysForBusiness */
export const toggleAllDaysForBusiness = async (
  bizId: string,
  session: ClientSession,
) => {
  const days = await BusinessDayConfigModel.find({ businessId: bizId }).session(
    session,
  );
  const anyOpen = days.some((d) => d.isOpen);
  const newState = !anyOpen;
  const impacted: any[] = [];

  for (const d of days) {
    d.isOpen = newState;
    await d.save({ session });
    await updatePeriodConfigsForDay(
      bizId,
      d.dayOfWeek,
      (p) => {
        p.isOpen = newState;
      },
      session,
    );
    impacted.push({ dayOfWeek: d.dayOfWeek });
  }
  await ensureBookingBusiness(bizId, impacted, session);
  return { newState };
};

/* toggleAllPeriodsForBusinessDay */
export const toggleAllPeriodsForBusinessDayByBusinessAndDow = async (
  businessId: string,
  dayOfWeek: number,
  session: ClientSession,
) => {
  const dayCfg = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek,
  }).session(session);
  if (!dayCfg) {
    throw new Error("BusinessDayConfig not found");
  }

  const perCfgs = await BusinessPeriodConfigModel.find({
    businessDayConfigId: dayCfg._id,
  }).session(session);

  const anyOpen = perCfgs.some((p) => p.isOpen);
  const newState = !anyOpen;

  for (const p of perCfgs) {
    p.isOpen = newState;
    await p.save({ session });
  }

  const impacted = perCfgs.map((p) => ({
    dayOfWeek: dayCfg.dayOfWeek,
    period: p.period,
    newAlloc: newState ? p.couponAllocations : [],
  }));

  await ensureBookingBusiness(businessId, impacted, session);

  return { dayOfWeek, newState };
};

export const toggleDayConfigService = async (
  businessId: string,
  dayOfWeek: number,
  session: ClientSession,
) => {
  const cfg = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek,
  }).session(session);
  if (!cfg) throw new Error("DayConfig not found");

  // Toggle the isOpen flag.
  cfg.isOpen = !cfg.isOpen;
  await cfg.save({ session });

  // If the day is now closed, make sure all its periods are closed.
  if (!cfg.isOpen) {
    await updatePeriodConfigsForDay(
      businessId,
      dayOfWeek,
      (p) => {
        p.isOpen = false;
      },
      session,
    );
  }
  // Rebuild the booking ledger for the impacted day.
  await ensureBookingBusiness(businessId, [{ dayOfWeek }], session);
  return cfg;
};

export const toggleSinglePeriod = async (
  businessId: string,
  dayOfWeek: number,
  period: number,
  session: ClientSession,
) => {
  // Find the relevant BusinessDayConfig
  const dayCfg = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek,
  }).session(session);

  if (!dayCfg) {
    throw new Error("BusinessDayConfig not found");
  }

  // Find the relevant BusinessPeriodConfig
  const periodCfg = await BusinessPeriodConfigModel.findOne({
    businessDayConfigId: dayCfg._id,
    period,
  }).session(session);

  if (!periodCfg) {
    throw new Error("BusinessPeriodConfig not found");
  }

  // Toggle the state
  periodCfg.isOpen = !periodCfg.isOpen;
  await periodCfg.save({ session });

  // Update impacted allocations for ledger synchronization
  const impacted = [
    {
      dayOfWeek,
      period,
      newAlloc: periodCfg.isOpen ? periodCfg.couponAllocations : [],
    },
  ];

  await ensureBookingBusiness(businessId, impacted, session);

  return {
    dayOfWeek,
    period,
    newState: periodCfg.isOpen,
  };
};
