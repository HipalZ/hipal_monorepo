import dayjs from 'dayjs';
import { ClientSession } from 'mongoose';
import { 
  BusinessDayConfigModel, 
  BusinessPeriodConfigModel, 
  BookingBusinessModel, 
  Business 
} from '@hi/db-models';
import { derivePeriod } from './utils';
import { formatMinutes, parseTimeToMinutes } from '@hi/db-models/src/models/bookingz/utils';

export interface SlotDetails {
  slot: string;
  displayTime: string;
  nextDay: boolean;
  period: number;
  coverCharge: number;
  remainingCapacity: number;
  couponsRemaining: { couponId: string; remaining: number }[];
  canAccommodate: boolean;
}

export const fetchSlotsForDay = async (
  businessId: string,
  date: string,
  numGuests: number,
  session: ClientSession | null = null
): Promise<Record<number, SlotDetails[]>> => {
  const bookingDateObj = dayjs(date);
  const dayOfWeek = bookingDateObj.day();
  const businessDayConfig = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek,
    archived_at: null,
  }).session(session);
  if (!businessDayConfig) throw new Error('No operating configuration found for this business and day.');
  
  const businessDoc = await Business.findById(businessId).session(session);
  const defaultCapacity = businessDoc ? businessDoc.capacity : 0;
  
  let startMinutes = parseTimeToMinutes(businessDayConfig.startTime);
  const endMinutes = parseTimeToMinutes(businessDayConfig.endTime);
  
  const today = dayjs().startOf('day');
  if (bookingDateObj.isSame(today, 'day')) {
    const currentPlus30 = dayjs().add(30, 'minute');
    const currentPlus30Minutes = currentPlus30.hour() * 60 + currentPlus30.minute();
    if (currentPlus30Minutes > startMinutes) startMinutes = currentPlus30Minutes;
  }
  
  const slotsGrouped: Record<number, SlotDetails[]> = {};
  
  for (let m = startMinutes; m < endMinutes; m += 30) {
    const slotStr = formatMinutes(m);
    const period = derivePeriod(slotStr);
    
    const periodConfigDoc = await BusinessPeriodConfigModel.findOne({
      businessDayConfigId: businessDayConfig._id,
      period,
      archived_at: null,
    }).session(session);
    const coverCharge = periodConfigDoc ? (periodConfigDoc.coverCharge || 0) : 0;
    
    const defaultCouponsRemaining = periodConfigDoc 
      ? (periodConfigDoc.couponAllocations || []).map((e: any) => ({
          couponId: e.couponId.toString(),
          remaining: e.quantity,
        }))
      : [];
      
    const bookingBusinessDoc = await BookingBusinessModel.findOne({
      businessId,
      date: bookingDateObj.toDate(),
      slot: slotStr,
      period,
    }).session(session);
    
    const remainingCapacity = bookingBusinessDoc ? bookingBusinessDoc.remainingCapacity : defaultCapacity;
    
    const couponsRemaining = bookingBusinessDoc && bookingBusinessDoc.couponsRemaining
      ? bookingBusinessDoc.couponsRemaining.map((entry: any) => ({
          couponId: entry.couponId.toString(),
          remaining: entry.remaining,
        }))
      : defaultCouponsRemaining;
    
    const canAccommodate = remainingCapacity >= numGuests;
    
    const [hourStr, minuteStr] = slotStr.split(':');
    const hour = parseInt(hourStr, 10);
    const displayTime = hour >= 24 
      ? `${(hour - 24).toString().padStart(2, '0')}:${minuteStr}` 
      : slotStr;
    const nextDay = hour >= 24;
    
    const slotObj: SlotDetails = { 
      slot: slotStr, 
      displayTime, 
      nextDay, 
      period, 
      coverCharge, 
      remainingCapacity, 
      couponsRemaining, 
      canAccommodate 
    };
    
    if (!slotsGrouped[period]) slotsGrouped[period] = [];
    slotsGrouped[period].push(slotObj);
  }
  
  return slotsGrouped;
};
