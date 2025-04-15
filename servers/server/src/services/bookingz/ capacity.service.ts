import {
  Business,
  BusinessDayConfigModel,
  BusinessPeriodConfigModel,
} from "@hi/db-models";
import type { ClientSession } from "mongoose";

/* 1. updateBusinessCapacity */
export const updateBusinessCapacity = async (
  businessId: string,
  newCapacity: number,
  session: ClientSession,
) => {
  if (newCapacity < 0) {
    throw new Error("Capacity cannot be negative");
  }
  const biz = await Business.findByIdAndUpdate(
    businessId,
    { capacity: newCapacity },
    { new: true, runValidators: true, session },
  );
  if (!biz) {
    throw new Error("Business not found");
  }
  return biz;
};

/* 2. hydrateBusinessDayConfig */
export const hydrateBusinessDayConfig = async (
  businessId: string,
  session: ClientSession,
) => {
  for (let dow = 0; dow <= 6; dow++) {
    const exists = await BusinessDayConfigModel.exists({
      businessId,
      dayOfWeek: dow,
    }).session(session);
    if (!exists) {
      await BusinessDayConfigModel.create(
        [
          {
            businessId,
            dayOfWeek: dow,
            startTime: "09:00",
            endTime: "21:00",
            isOpen: false,
            closedIntervals: [],
          },
        ],
        { session },
      );
    }
  }
};

/* 3. hydrateBusinessPeriodConfig */
export const hydrateBusinessPeriodConfig = async (
  businessId: string,
  session: ClientSession,
) => {
  for (let dow = 0; dow <= 6; dow++) {
    const dayCfg = await BusinessDayConfigModel.findOne({
      businessId,
      dayOfWeek: dow,
    }).session(session);
    if (!dayCfg) continue;
    for (let p = 0; p <= 3; p++) {
      const exists = await BusinessPeriodConfigModel.exists({
        businessDayConfigId: dayCfg._id,
        period: p,
      }).session(session);
      if (!exists) {
        await BusinessPeriodConfigModel.create(
          [{ businessDayConfigId: dayCfg._id, period: p, isOpen: false }],
          { session },
        );
      }
    }
  }
};
