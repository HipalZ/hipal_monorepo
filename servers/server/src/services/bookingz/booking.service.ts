import { ClientSession } from 'mongoose';
import dayjs from 'dayjs';
import {
  inClosedInterval,
  derivePeriod,
  generateQRCode,
  generateUniqueCode,
} from './booking.utils';
import { fetchOrUpsertBookingBusiness } from './booking-business.service';
import { BookingBusinessModel, BookingModel, Business, BusinessDayConfigModel, BusinessPeriodConfigModel, Couponz, User } from '@hi/db-models';
import { calculateRemainingCapacity } from './slot.service';

/* createCustomerBooking / createManagerBooking */
export const createCustomerBooking = async (
  bizId: string,
  customerId: string,
  input: any,
  session: ClientSession,
) => commonCreateBooking(bizId, customerId, customerId, input, session);

export const createManagerBooking = async (
  bizId: string,
  managerId: string,
  input: any,
  session: ClientSession,
) => {
  const found = await User.findOne({ phone: input.walkIn?.phone, active: true }).session(
    session,
  );
  const customerId = found ? found._id.toString() : null;
  return commonCreateBooking(bizId, customerId, managerId, input, session);
};

/* commonCreateBooking */
export const commonCreateBooking = async (
  bizId: string,
  customerId: string | null,
  creatorId: string,
  input: any,
  session: ClientSession,
) => {
  const { bookingDate, slot, numberOfGuests, couponId, walkIn } = input;

  const biz = await Business.findById(bizId).session(session);
  if (!biz || !biz.isBookingActive) throw new Error('Bookings disabled');

  const dow = dayjs(bookingDate).day();
  const dayCfg = await BusinessDayConfigModel.findOne({
    businessId: bizId,
    dayOfWeek: dow,
    isOpen: true,
  }).session(session);
  if (!dayCfg) throw new Error('Day closed');
  if (inClosedInterval(dayCfg, slot)) throw new Error('Closed interval');

  const period = derivePeriod(slot);
  const perCfg = await BusinessPeriodConfigModel.findOne({
    businessDayConfigId: dayCfg._id,
    period,
    isOpen: true,
  }).session(session);
  if (!perCfg) throw new Error('Period closed');

  if ((await calculateRemainingCapacity(bizId, bookingDate, slot)) < numberOfGuests)
    throw new Error('Capacity exceeded');

  /* Coupon logic */
  let couponSnap = null as any;
  if (couponId) {
    const coupon = await Couponz.findOne({ _id: couponId, isDeleted: false }).session(
      session,
    );
    if (!coupon || coupon.type !== 'BOOKINGS') throw new Error('Invalid coupon');
    if (
      coupon.bookingMeta?.minGuests &&
      numberOfGuests < coupon.bookingMeta.minGuests
    )
      throw new Error('Guest count below coupon minimum');

    const bb = await fetchOrUpsertBookingBusiness(bizId, bookingDate, period, session);
    const cEntry = bb.couponsRemaining.find((e) => e.couponId.equals(couponId));
    if (!cEntry || cEntry.remaining < 1) throw new Error('No coupon inventory');
    cEntry.remaining -= 1;
    await bb.save({ session });

    couponSnap = {
      couponId,
      versionId: cEntry.versionId,
      name: coupon.name,
      config: coupon.config,
      bookingMeta: coupon.bookingMeta,
    };
  }

  const finalBase = couponSnap?.bookingMeta?.baseCharge ?? perCfg.baseCharge;
  const finalRedeem =
    couponSnap?.bookingMeta?.redeemableCoverCharge ?? perCfg.redeemableCoverCharge;

  const bookingBill = finalBase;
  const status: any = bookingBill > 0 ? 'pending' : 'paid';
  const holdExpiry = bookingBill > 0 ? dayjs().add(15, 'minute').toDate() : null;

  const newBooking = await BookingModel.create(
    [
      {
        customerId,
        createdByUserId: creatorId,
        businessId: bizId,
        bookingDate,
        slot,
        period,
        numberOfGuests,
        coupon: couponSnap,
        bookingBill,
        redeemableCoverCharge: finalRedeem,
        status,
        holdExpiresAt: holdExpiry,
        walkInName: walkIn?.name ?? null,
        walkInPhone: walkIn?.phone ?? null,
        walkInEmail: walkIn?.email ?? null,
        qrCode: null,
        uniqueCode: null,
        bookingPaymentId: null,
        checkInCount: 0,
        minCheckInTime: dayjs(`${bookingDate} ${slot}`).toDate(),
        maxCheckInTime: dayjs(`${bookingDate} ${slot}`).add(90, 'minute').toDate(),
      },
    ],
    { session },
  );
  return newBooking[0];
};

/* finalizePayment */
export const finalizePayment = async (
  bookingId: string,
  payment: { success: boolean; paymentId: string },
  session: ClientSession,
) => {
  if (!payment.success) return;
  const b = await BookingModel.findById(bookingId).session(session);
  if (!b) throw new Error('Booking not found');

  if (b.status === 'pending') {
    b.status = 'paid';
    b.qrCode = generateQRCode(bookingId);
    b.uniqueCode = generateUniqueCode(bookingId);
    b.bookingPaymentId = payment.paymentId;
  } else if (b.status === 'cancelled') {
    // TODO: trigger refund webhook
    b.note += ` | refund ${payment.paymentId}`;
  } else {
    b.note += ` | extra payment ${payment.paymentId}`;
  }
  await b.save({ session });
  return b;
};

/* expirePendingBookings */
export const expirePendingBookings = async () => {
  const now = dayjs().toDate();
  const stale = await BookingModel.find({
    status: 'pending',
    holdExpiresAt: { $lt: now },
  });
  for (const b of stale) {
    await cancelBooking(b._id.toString(), true);
  }
};

/* checkInBooking */
export const checkInBooking = async (
  bookingId: string,
  addCount: number,
  session: ClientSession,
) => {
  const b = await BookingModel.findById(bookingId).session(session);
  if (!b || b.status !== 'paid') throw new Error('Booking not payable for check‑in');

  const now = dayjs();
  if (now.isBefore(dayjs(b.minCheckInTime))) throw new Error('Too early');
  if (now.isAfter(dayjs(b.maxCheckInTime))) {
    b.status = 'check-in-late';
    await b.save({ session });
    throw new Error('Too late');
  }
  if (b.checkInCount + addCount > b.numberOfGuests) throw new Error('Too many guests');
  b.checkInCount += addCount;
  b.status = 'check-in';
  await b.save({ session });
  return b;
};

/* revertCapacityAndCoupon */
export const revertCapacityAndCoupon = async (bookingId: string, session: ClientSession) => {
  const b = await BookingModel.findById(bookingId).session(session);
  if (!b) throw new Error('Booking not found');
  if (dayjs().isAfter(dayjs(`${b.bookingDate} ${b.slot}`))) throw new Error('Slot passed');

  const bb = await BookingBusinessModel.findOne({
    businessId: b.businessId,
    date: b.bookingDate,
    period: b.period,
  }).session(session);
  if (!bb) throw new Error('BookingBusiness row missing');

  if (b.coupon) {
    const snap = b.coupon;
    const entry = bb.couponsRemaining.find((x) => x.couponId.equals(snap.couponId));
    if (entry && entry.versionId === snap.versionId) entry.remaining += 1;
  }
  await bb.save({ session });
};

/* cancelBooking */
export const cancelBooking = async (
  bookingId: string,
  shouldRevert = true,
  session?: ClientSession,
) => {
  if (shouldRevert && session) {
    await revertCapacityAndCoupon(bookingId, session);
  }
  await BookingModel.updateOne({ _id: bookingId }, { status: 'cancelled' }).session(session || null);
};
