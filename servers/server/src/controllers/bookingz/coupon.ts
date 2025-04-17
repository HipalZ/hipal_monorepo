import {
  createBookingCouponService,
  getBookingCouponByIdService,
  getBusinessBookingCouponsService,
  updateBookingCouponService,
} from "@/services/bookingz/coupon.service";
import type {
  BookingCouponCreateType,
  BookingCouponUpdateType,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import type { Context } from "hono";

export const createBookingCouponController = async (c: Context) => {
  const { businessId } = c.req.param();
  const payload = await c.req.json<BookingCouponCreateType>();
  const coupon = await runInTransaction((session) =>
    createBookingCouponService(businessId, payload, session),
  );
  return c.json({ status: 201, data: coupon, message: "Coupon created." }, 201);
};

export const updateBookingCouponController = async (c: Context) => {
  const { couponId } = c.req.param();
  const payload = await c.req.json<BookingCouponUpdateType>();
  const coupon = await runInTransaction((session) =>
    updateBookingCouponService(couponId, payload, session),
  );
  return c.json({ status: 200, data: coupon, message: "Coupon updated." });
};

export const getBusinessBookingCouponsController = async (c: Context) => {
  const { businessId } = c.req.param();
  const coupons = await getBusinessBookingCouponsService(businessId);
  return c.json({ status: 200, data: coupons, message: "Coupons fetched" });
};

export const getBookingCouponByIdController = async (c: Context) => {
  const { couponId } = c.req.param();
  const coupon = await getBookingCouponByIdService(couponId);
  return c.json({ status: 200, data: coupon, message: "Coupon fetched" });
};
