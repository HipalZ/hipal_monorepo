import { BookingBusinessModel, BookingModel, BusinessDayConfigModel } from "@hi/db-models";
import { ClientSession } from "mongoose";
import dayjs, { Dayjs } from "dayjs";

export const derivePeriod = (slot: string): number => {
  const [hourStr, minuteStr] = slot.split(':');
  const totalMinutes = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
  if (totalMinutes >= 240 && totalMinutes < 720) return 0;
  if (totalMinutes >= 720 && totalMinutes < 960) return 1;
  if (totalMinutes >= 960 && totalMinutes < 1140) return 2;
  if (totalMinutes >= 1140 && totalMinutes <= 1680) return 3;
  throw new Error('Slot time does not fall within any period.');
};
export const fetchOrCreateBookingBusiness = async (
  businessId: string,
  bookingDate: string,
  slot: string,
  period: number,
  businessCapacity: number,
  couponAllocations: { couponId: string; quantity: number }[],
  session?: any
) => {
  let bookingBusiness = await BookingBusinessModel.findOne({ businessId, date: bookingDate, slot, period }).session(session || null);
  if (!bookingBusiness) {
    bookingBusiness = new BookingBusinessModel({
      businessId,
      date: bookingDate,
      period,
      slot,
      remainingCapacity: businessCapacity,
      couponsRemaining: couponAllocations.map(ca => ({ couponId: ca.couponId, remaining: ca.quantity })),
      bookingsInThisSlot: []
    });
    await bookingBusiness.save({ session });
  }
  return bookingBusiness;
};
export const generateQRCode = (bookingId: string): string => {
  const qrData = `https://example.com/booking/${bookingId}`;
  return Buffer.from(qrData).toString('base64');
};

export const revertCapacityAndCoupon = async (
  bookingId: string,
  session: ClientSession | null
) => {
  const booking = await BookingModel.findById(bookingId).session(session);
  if (!booking) throw new Error(`Booking ${bookingId} not found`);

  // Calculate booking start time from bookingDate and slot.
  const [rawHourStr, minuteStr] = booking.slot.split(':');
  const rawHour = parseInt(rawHourStr, 10);
  const minutes = parseInt(minuteStr, 10);
  const bookingStart = rawHour >= 24
    ? dayjs(booking.bookingDate).add(1, 'day').hour(rawHour - 24).minute(minutes).second(0)
    : dayjs(booking.bookingDate).hour(rawHour).minute(minutes).second(0);

  if (dayjs().isAfter(bookingStart))
    throw new Error('Booking has already started; cannot revert capacity or coupon.');

  // Retrieve BookingBusiness record for this booking.
  const bookingBusiness = await BookingBusinessModel.findOne({
    businessId: booking.businessId,
    date: booking.bookingDate,
    slot: booking.slot,
    period: booking.period
  }).session(session);
  if (!bookingBusiness) throw new Error('BookingBusiness record not found');

  // Restore the remaining capacity.
  bookingBusiness.remainingCapacity += booking.numberOfGuests;

  // If couponId exists (not undefined or null) and couponsRemaining is available, restore coupon allocation.
  if (booking.couponId != null && bookingBusiness.couponsRemaining) {
    const couponEntry = bookingBusiness.couponsRemaining.find(
      (entry: { couponId: any; remaining: number }) =>
        entry.couponId.toString() === booking.couponId!.toString()
    );
    if (couponEntry) couponEntry.remaining += booking.numberOfGuests;
  }

  // Remove the booking ID from the bookingsInThisSlot array.
  bookingBusiness.bookingsInThisSlot = (bookingBusiness.bookingsInThisSlot || []).filter(
    (id: any) => !id.equals(booking._id)
  );

  await bookingBusiness.save({ session });
};


export const cancelBooking = async (
  bookingId: string,
  session: ClientSession | null
) => {
  await revertCapacityAndCoupon(bookingId, session);
  const booking = await BookingModel.findByIdAndUpdate(
    bookingId,
    { status: 'cancelled' },
    { new: true, session }
  );
  if (!booking) throw new Error(`Booking ${bookingId} not found during cancellation.`);
  return booking;
};


export const finalizePayment = async (
  bookingId: string,
  success: boolean,
  session: ClientSession | null
) => {
  if (success) {
    const qrCode = generateQRCode(bookingId);
    const booking = await BookingModel.findByIdAndUpdate(
      bookingId,
      { status: 'paid', qrCode },
      { new: true, session }
    );
    if (!booking)
      throw new Error(`Booking ${bookingId} not found during payment finalization.`);
    return booking;
  } else {
    return await cancelBooking(bookingId, session);
  }
};


export const getBusinessPeriodTimeRange = async (
  businessId: string,
  bookingDate: Date,
  slot: string,
  period: number
): Promise<{ slotStart: Dayjs; periodEnd: Dayjs }> => {
  // Default Hipalz period ranges.
  const defaultPeriodRanges: { [key: number]: { start: string; end: string } } = {
    0: { start: "04:00", end: "12:00" },
    1: { start: "12:00", end: "16:00" },
    2: { start: "16:00", end: "19:00" },
    3: { start: "19:00", end: "28:00" },
  };

  // Calculate slotStart from the booking slot.
  const [slotHourStr, slotMinuteStr] = slot.split(':');
  let slotHour = parseInt(slotHourStr, 10);
  const slotMinutes = parseInt(slotMinuteStr, 10);
  let slotStart: Dayjs = slotHour >= 24 
    ? dayjs(bookingDate).add(1, 'day').hour(slotHour - 24).minute(slotMinutes).second(0)
    : dayjs(bookingDate).hour(slotHour).minute(slotMinutes).second(0);

  // Compute default period end from the standard range.
  const defaultRange = defaultPeriodRanges[period];
  const [defEndHourStr, defEndMinuteStr] = defaultRange.end.split(':');
  let defEndHour = parseInt(defEndHourStr, 10);
  const defEndMinutes = parseInt(defEndMinuteStr, 10);
  let defaultPeriodEnd: Dayjs = defEndHour >= 24 
    ? dayjs(bookingDate).add(1, 'day').hour(defEndHour - 24).minute(defEndMinutes).second(0)
    : dayjs(bookingDate).hour(defEndHour).minute(defEndMinutes).second(0);

  // Fetch business operating config for the booking's day.
  const dayOfWeek = dayjs(bookingDate).day(); // 0 (Sunday) to 6 (Saturday)
  const businessConfig = await BusinessDayConfigModel.findOne({
    businessId,
    dayOfWeek,
    archived_at: null,
  });

  let businessPeriodEnd: Dayjs;
  if (businessConfig) {
    const [bizEndHourStr, bizEndMinuteStr] = businessConfig.endTime.split(':');
    let bizEndHour = parseInt(bizEndHourStr, 10);
    const bizEndMinutes = parseInt(bizEndMinuteStr, 10);
    businessPeriodEnd = bizEndHour >= 24
      ? dayjs(bookingDate).add(1, 'day').hour(bizEndHour - 24).minute(bizEndMinutes).second(0)
      : dayjs(bookingDate).hour(bizEndHour).minute(bizEndMinutes).second(0);
  } else {
    // If no config is found, fall back to the default period end.
    businessPeriodEnd = defaultPeriodEnd;
  }

  // Use the earlier of defaultPeriodEnd and the business operating end.
  const periodEnd = defaultPeriodEnd.isBefore(businessPeriodEnd) ? defaultPeriodEnd : businessPeriodEnd;

  return { slotStart, periodEnd };
};


export const checkInBookingService = async (
  bookingId: string,
  checkInCount: number,
  session: ClientSession | null = null
) => {
  const booking = await BookingModel.findById(bookingId).session(session);
  if (!booking) throw new Error(`Booking ${bookingId} not found.`);

  const now = dayjs();

  // Get the effective check-in time range using the business's operating hours.
  const periodRange = await getBusinessPeriodTimeRange(
    booking.businessId.toString(),
    booking.bookingDate,
    booking.slot,
    booking.period
  );

  // If it's too early, throw an error.
  if (now.isBefore(periodRange.slotStart)) {
    throw new Error("Too early to check in. Please wait until your slot begins.");
  }
  
  // If the check-in window has expired, update status and throw an error.
  if (now.isAfter(periodRange.periodEnd)) {
    booking.status = "expired";
    await booking.save({ session });
    throw new Error("Check-in period has expired.");
  }
  
  // Ensure the check-in count does not exceed the booked guest count.
  if (booking.checkInCount + checkInCount > booking.numberOfGuests) {
    throw new Error("Check-in count exceeds booked guest count.");
  }
  
  // Increment the check-in count and update booking status.
  booking.checkInCount += checkInCount;
  booking.status = "check-in";
  await booking.save({ session });
  
  return booking;
};