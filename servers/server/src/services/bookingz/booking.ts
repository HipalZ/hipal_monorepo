import mongoose, { ClientSession } from 'mongoose';
import { BookingModel, Business, BusinessPeriodConfigModel, User } from '@hi/db-models';
import { derivePeriod, fetchOrCreateBookingBusiness } from './utils';

export interface BookingInputType {
  bookingDate: string;
  slot: string;
  numberOfGuests: number;
  couponId?: string;
  walkIn?: {
    phone: string;
    name?: string;
    email?: string;
    manager_id: string;
  };
}

const commonCreateBookingFunctionalityService = async (
  businessId: string,
  bookingCustomerId: string | null,
  creatorId: string,
  input: BookingInputType,
  session: ClientSession
) => {
  // Find the active business.
  const business = await Business.findOne({ _id: businessId, archived_at: null }).session(session);
  if (!business) throw new Error('Business does not exist.');

  // Derive the period for the given slot.
  const period = derivePeriod(input.slot);

  // Fetch period configuration (cover charge, coupon allocations).
  const periodConfig = await BusinessPeriodConfigModel.findOne({ businessId, period, archived_at: null }).session(session);
  if (!periodConfig) throw new Error(`Period configuration not found for period ${period}`);

  const coverCharge = periodConfig.coverCharge || 0;
  const couponAllocations = (periodConfig.couponAllocations || []).map((e: any) => ({
    couponId: e.couponId.toString(),
    quantity: e.quantity,
  }));

  // Get or create the record tracking capacity and coupon usage for this slot.
  const bookingBusiness = await fetchOrCreateBookingBusiness(
    businessId,
    input.bookingDate,
    input.slot,
    period,
    business.capacity,
    couponAllocations,
    session
  );

  // Validate capacity.
  if (bookingBusiness.remainingCapacity < input.numberOfGuests)
    throw new Error('Not enough capacity.');

  // Validate coupon and reduce allocation if applicable.
  if (input.couponId) {
    if (!bookingBusiness.couponsRemaining) throw new Error('Coupons information missing.');
    const couponEntry = bookingBusiness.couponsRemaining.find(
      (entry: { couponId: any; remaining: number }) => entry.couponId.toString() === input.couponId
    );
    if (!couponEntry || couponEntry.remaining < input.numberOfGuests)
      throw new Error('Insufficient coupon allocation.');
    couponEntry.remaining -= input.numberOfGuests;
  }

  // Deduct the guest count from remaining capacity.
  bookingBusiness.remainingCapacity -= input.numberOfGuests;
  bookingBusiness.bookingsInThisSlot = bookingBusiness.bookingsInThisSlot || [];

  // Calculate total cover charge and determine payment status.
  const coverChargeTotal = coverCharge * input.numberOfGuests;
  let paymentStatus: 'pending' | 'paid';
  let holdExpiresAt: Date | null;
  if (coverChargeTotal > 0) {
    paymentStatus = 'pending';
    holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  } else {
    paymentStatus = 'paid';
    holdExpiresAt = null;
  }

  // Assemble booking data.
  const bookingData = {
    customerId: bookingCustomerId,
    createdBy: creatorId,
    businessId,
    bookingDate: input.bookingDate,
    slot: input.slot,
    period,
    numberOfGuests: input.numberOfGuests,
    couponId: input.couponId || null,
    coverChargeTotal,
    status: paymentStatus,
    holdExpiresAt,
    walkInName: input.walkIn?.name || null,
    walkInPhone: input.walkIn?.phone || null,
    walkInEmail: input.walkIn?.email || null,
    qrCode: null,
    checkInCount: 0,
    archived_at: null,
  };

  // Create and save the booking document.
  const booking = new BookingModel(bookingData);
  await booking.save({ session });

  // Directly push the booking ID into the bookings array.
  bookingBusiness.bookingsInThisSlot.push(booking._id);
  await bookingBusiness.save({ session });

  return booking;
};

export const createCustomerBookingService = async (
  businessId: string,
  customerId: string,
  input: BookingInputType,
  session: ClientSession
) => commonCreateBookingFunctionalityService(businessId, customerId, customerId, input, session);

export const createManagerBookingService = async (
  businessId: string,
  managerId: string,
  input: BookingInputType,
  session: ClientSession
) => {
  // Look up the customer by phone for a walk-in booking.
  const foundCustomer = await User.findOne({ phone: input.walkIn?.phone, active: true })
    .select('_id')
    .session(session);
  const bookingCustomerId = foundCustomer ? foundCustomer._id.toString() : null;
  return commonCreateBookingFunctionalityService(businessId, bookingCustomerId, managerId, input, session);
};
