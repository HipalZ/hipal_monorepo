import {
  type BookingCouponCreateType,
  type BookingCouponUpdateType,
  Couponz,
} from "@hi/db-models";
import { Types, type ClientSession } from "mongoose";

export const createBookingCouponService = async (
  businessId: string,
  payload: BookingCouponCreateType,
  session: ClientSession,
) => {
  const doc = new Couponz({
    name: payload.name,
    type: "BOOKINGS",
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

export const updateBookingCouponService = async (
  couponId: string,
  payload: BookingCouponUpdateType,
  session: ClientSession,
) => {
  const existing = await Couponz.findOne({
    _id: couponId,
    type: "BOOKINGS",
    isDeleted: false,
  }).session(session);
  if (!existing) throw new Error("Coupon not found or not of type BOOKINGS");
  if (!existing.config) {
    existing.config = { value: 0, discountType: "AMOUNT" };
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
    if (discountType === "PERCENTAGE") {
      if (upto !== undefined) {
        existing.config.upto = upto;
      }
    } else {
      existing.set("config.upto", undefined);
      existing.markModified("config.upto");
    }
    existing.markModified("config");
  }

  if (payload.bookingMeta !== undefined) {
    const { baseCharge, redeemableCoverCharge, minGuests } =
      payload.bookingMeta;
    if (baseCharge !== undefined) {
      existing.bookingMeta.baseCharge = baseCharge;
    }
    if (redeemableCoverCharge !== undefined) {
      existing.bookingMeta.redeemableCoverCharge = redeemableCoverCharge;
    }
    if (minGuests !== undefined) {
      existing.bookingMeta.minGuests = minGuests;
    }
    existing.markModified("bookingMeta");
  }

  await existing.save({ session });
  return existing;
};

/** Fetch all non‑deleted BOOKINGS coupons for a business */
export const getBusinessBookingCouponsService = async (businessId: string) => {
  return Couponz.find({
    businessId,
    type: "BOOKINGS",
    isDeleted: false,
  });
};

/** Fetch one by _id */
export const getBookingCouponByIdService = async (couponId: string) => {
  const coupon = await Couponz.findOne({
    _id: couponId,
    type: "BOOKINGS",
    isDeleted: false,
  });
  if (!coupon) throw new Error("Coupon not found");
  return coupon;
};
