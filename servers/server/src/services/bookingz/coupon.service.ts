import {
  BookingBusinessModel,
  BookingModel,
  BusinessDayConfigModel,
  BusinessPeriodConfigModel,
  Couponz,
  type BookingCouponCreateType,
  type BookingCouponUpdateType,
} from '@hi/db-models';
import { Types, type ClientSession } from 'mongoose';
import { ensureBookingBusiness } from './booking-business.service';
import dayjs from 'dayjs';

export const createBookingCouponService = async (businessId: string, payload: BookingCouponCreateType, session: ClientSession) => {
  const doc = new Couponz({
    name: payload.name,
    type: 'BOOKINGS',
    businessId: new Types.ObjectId(businessId),
    isDeleted: false,
    config: {
      value: payload?.config?.value,
      discountType: payload?.config?.discountType,
      ...(payload?.config?.upto !== undefined && {
        upto: payload?.config?.upto,
      }),
    },
    bookingMeta: {
      baseCharge: payload?.bookingMeta?.baseCharge,
      ...(payload.bookingMeta?.redeemableCoverCharge !== undefined && {
        redeemableCoverCharge: payload?.bookingMeta?.redeemableCoverCharge,
      }),
      ...(payload?.bookingMeta?.minGuests !== undefined && {
        minGuests: payload?.bookingMeta?.minGuests,
      }),
    },
  });
  await doc.save({ session });
  return doc;
};

export const updateBookingCouponService = async (couponId: string, payload: BookingCouponUpdateType, session: ClientSession) => {
  const existing = await Couponz.findOne({
    _id: couponId,
    type: 'BOOKINGS',
    isDeleted: false,
  }).session(session);
  if (!existing) throw new Error('Coupon not found or not of type BOOKINGS');
  if (!existing.config) {
    existing.config = { value: 0, discountType: 'AMOUNT' };
  }
  if (!existing.bookingMeta) {
    existing.bookingMeta = {
      baseCharge: 0,
      redeemableCoverCharge: 0,
      minGuests: 0,
    };
  }

  if (payload.name !== undefined) {
    existing.name = payload.name;
  }

  if (payload.config !== undefined) {
    const { value, discountType, upto } = payload.config;
    existing.config.value = value;
    existing.config.discountType = discountType;
    if (discountType === 'PERCENTAGE') {
      if (upto !== undefined) {
        existing.config.upto = upto;
      }
    } else {
      existing.set('config.upto', undefined);
      existing.markModified('config.upto');
    }
    existing.markModified('config');
  }

  if (payload.bookingMeta !== undefined) {
    const { baseCharge, redeemableCoverCharge, minGuests } = payload.bookingMeta;
    if (baseCharge !== undefined) {
      existing.bookingMeta.baseCharge = baseCharge;
    }
    if (redeemableCoverCharge !== undefined) {
      existing.bookingMeta.redeemableCoverCharge = redeemableCoverCharge;
    }
    if (minGuests !== undefined) {
      existing.bookingMeta.minGuests = minGuests;
    }
    existing.markModified('bookingMeta');
  }

  await existing.save({ session });
  return existing;
};

/** Fetch all BOOKINGS coupons for a business */
export const getBusinessBookingCouponsService = async (
  businessId: string,
  includeArchived = false
) => {
  const filter: Record<string, any> = {
    businessId,
    type: "BOOKINGS",
  };
  if (!includeArchived) {
    filter.isDeleted = false;
  }
  return Couponz.find(filter);
};

/** Fetch one by _id */
export const getBookingCouponByIdService = async (couponId: string) => {
  const coupon = await Couponz.findOne({
    _id: couponId,
    type: 'BOOKINGS',
    isDeleted: false,
  });
  if (!coupon) throw new Error('Coupon not found');
  return coupon;
};

// archive coupon batch
export const archiveBookingCouponsService = async (couponIds: string[], session: ClientSession) => {
  // A) Duplicate‑ID guard (redundant with Zod but double‑safe)
  const uniqueIds = Array.from(new Set(couponIds));
  if (uniqueIds.length !== couponIds.length) {
    throw new Error('Duplicate coupon IDs provided');
  }

  // B) Load and validate coupons in one go
  const objectIds = couponIds.map((id) => new Types.ObjectId(id));
  const coupons = await Couponz.find({ _id: { $in: objectIds } }).session(session);

  // C) Existence/type/deletion checks
  const foundIds = new Set(coupons.map((c) => c._id.toString()));
  const errors: string[] = [];

  couponIds.filter((id) => !foundIds.has(id)).forEach((id) => errors.push(`Coupon ${id} not found`));

  for (const c of coupons) {
    if (c.type !== 'BOOKINGS') errors.push(`Coupon ${c._id} is not of type BOOKINGS`);
    if (c.isDeleted) errors.push(`Coupon ${c._id} is already archived`);
  }

  if (errors.length) {
    throw new Error(errors.join('; '));
  }

  // D) All coupons must share the same businessId
  const businessIds = new Set(coupons.map((c) => c.businessId.toString()));
  if (businessIds.size > 1) {
    throw new Error('Cannot archive coupons from multiple businesses');
  }
  const businessId = coupons[0].businessId.toString();

  // E) Soft‑delete them
  for (const c of coupons) {
    c.isDeleted = true;
    await c.save({ session });
  }

  // F) Scrub period‑configs & collect impacted slots
  const periodConfigs = await BusinessPeriodConfigModel.find({
    'couponAllocations.couponId': { $in: objectIds },
  }).session(session);

  const impacted: {
    dayOfWeek: number;
    period: number;
    newAlloc: { couponId: string; remaining: number }[];
  }[] = [];

  if (periodConfigs.length) {
    const dayCfgIds = Array.from(new Set(periodConfigs.map((pc) => pc.businessDayConfigId.toString())));
    const dayCfgs = await BusinessDayConfigModel.find({
      _id: { $in: dayCfgIds },
    })
      .session(session)
      .select('_id dayOfWeek')
      .lean<{ _id: Types.ObjectId; dayOfWeek: number }[]>();

    const dowMap = new Map(dayCfgs.map((d) => [d._id.toString(), d.dayOfWeek]));

    for (const pc of periodConfigs) {
      pc.couponAllocations = pc.couponAllocations.filter((a) => !objectIds.some((id) => id.equals(a.couponId)));
      await pc.save({ session });

      impacted.push({
        dayOfWeek: dowMap.get(pc.businessDayConfigId.toString())!,
        period: pc.period,
        newAlloc: pc.couponAllocations.map((a) => ({
          couponId: a.couponId.toString(),
          remaining: a.remaining,
        })),
      });
    }
  }

  // G) Scrub explicitly‑edited ledger rows
  const explicitRows = await BookingBusinessModel.find({
    businessId,
    explicitlyEdited: true,
    'couponsRemaining.couponId': { $in: objectIds },
  }).session(session);

  for (const row of explicitRows) {
    row.couponsRemaining = row.couponsRemaining.filter((a) => !objectIds.some((id) => id.equals(a.couponId)));
    await row.save({ session });
  }

  // H) Reseed non‑explicit rows for impacted slots
  if (impacted.length) {
    await ensureBookingBusiness(businessId, impacted, session);
  }

  return coupons;
};

// coupon report

export const getBookingCouponReportService = async (
  couponId: string
): Promise<{
  periodConfigs: Record<
    number,
    Record<number, any>
  >;
  explicitBookingBusinesses: Record<
    string,
    Record<number, any[]>
  >;
  claimedBookings: Record<
    string,
    Record<number, Record<string, any[]>>
  >;
}> => {
  const oid = new Types.ObjectId(couponId);

  // 1) Ensure coupon exists
  const coupon = await Couponz.findById(oid);
  if (!coupon) throw new Error("Coupon not found");

  // ── 1. Period configs ────────────────────────────────────────
  const periodConfigs = await BusinessPeriodConfigModel.find({
    "couponAllocations.couponId": oid,
  }).lean();
  const dayCfgIds = Array.from(
    new Set(
      periodConfigs.map((pc) => pc.businessDayConfigId.toString())
    )
  );

  const dayCfgs = await BusinessDayConfigModel.find({
    _id: { $in: dayCfgIds },
  })
    .select("_id dayOfWeek")
    .lean<{ _id: Types.ObjectId; dayOfWeek: number }[]>();
  const dowMap = new Map(
    dayCfgs.map((d) => [d._id.toString(), d.dayOfWeek])
  );

  const periodConfigMap: Record<number, Record<number, any>> = {};
  for (const pc of periodConfigs) {
    const dow = dowMap.get(pc.businessDayConfigId.toString())!;
    periodConfigMap[dow] ??= {};
    periodConfigMap[dow][pc.period] = pc;
  }

  // ── 2. Explicitly‐edited booking‐business rows ───────────────
  const bbRows = await BookingBusinessModel.find({
    explicitlyEdited: true,
    "couponsRemaining.couponId": oid,
  }).lean();
  const explicitMap: Record<
    string,
    Record<number, any[]>
  > = {};
  for (const row of bbRows) {
    const dateKey = dayjs(row.date).format("YYYY-MM-DD");
    explicitMap[dateKey] ??= {};
    explicitMap[dateKey][row.period] ??= [];
    explicitMap[dateKey][row.period].push(row);
  }

  // ── 3. Actual bookings that claimed the coupon ───────────────
  const bookingRows = await BookingModel.find({
    "coupon.couponId": oid,
  }).lean();
  const claimedMap: Record<
    string,
    Record<number, Record<string, any[]>>
  > = {};
  for (const b of bookingRows) {
    const dateKey = dayjs(b.bookingDate).format("YYYY-MM-DD");
    claimedMap[dateKey] ??= {};
    claimedMap[dateKey][b.period] ??= {};
    claimedMap[dateKey][b.period][b.slot] ??= [];
    claimedMap[dateKey][b.period][b.slot].push(b);
  }

  return {
    periodConfigs: periodConfigMap,
    explicitBookingBusinesses: explicitMap,
    claimedBookings: claimedMap,
  };
};
