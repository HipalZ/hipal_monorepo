import { BusinessPeriodConfigModel } from '@hi/db-models';
import type { ClientSession } from 'mongoose';

export const createPeriodConfig = async (dayConfigId: string, period: number, coverCharge: number, couponAllocations: { couponId: string; quantity: number }[] = [], session?: ClientSession) => {
  const config = new BusinessPeriodConfigModel({ businessDayConfigId: dayConfigId, period, coverCharge, couponAllocations });
  await config.save({ session });
  return config;
};
export const updatePeriodConfig = async (configId: string, updatedFields: Record<string, any>, session?: ClientSession) => {
  const config = await BusinessPeriodConfigModel.findByIdAndUpdate(configId, { $set: updatedFields }, { new: true, session });
  if (!config) throw new Error('BusinessPeriodConfig not found.');
  return config;
};
export const archivePeriodConfig = async (configId: string, session?: ClientSession) => {
  const config = await BusinessPeriodConfigModel.findByIdAndUpdate(configId, { archived_at: new Date() }, { new: true, session });
  if (!config) throw new Error('BusinessPeriodConfig not found.');
  return config;
};
