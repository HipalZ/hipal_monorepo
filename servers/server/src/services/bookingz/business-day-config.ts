import { BusinessDayConfigModel } from '@hi/db-models';
import type { ClientSession } from 'mongoose';
export const createDayConfig = async (businessId: string, dayOfWeek: number, startTime: string, endTime: string, session?: ClientSession) => {
  const config = new BusinessDayConfigModel({ businessId, dayOfWeek, startTime, endTime });
  await config.save({ session });
  return config;
};
export const updateDayConfig = async (configId: string, updatedFields: Record<string, any>, session?: ClientSession) => {
  const config = await BusinessDayConfigModel.findByIdAndUpdate(configId, { $set: updatedFields }, { new: true, session });
  if (!config) throw new Error('BusinessDayConfig not found.');
  return config;
};
export const archiveDayConfig = async (configId: string, session?: ClientSession) => {
  const config = await BusinessDayConfigModel.findByIdAndUpdate(configId, { archived_at: new Date() }, { new: true, session });
  if (!config) throw new Error('BusinessDayConfig not found.');
  return config;
};
