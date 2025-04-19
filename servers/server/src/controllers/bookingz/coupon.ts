import {
  archiveBookingCouponsService,
  createBookingCouponService,
  getBookingCouponByIdService,
  getBookingCouponReportService,
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
  // after zQueryValidator, `includeArchived` is already coerced to boolean
  const { includeArchived } = c.req.valid("query") as { includeArchived?: boolean };
  const coupons = await getBusinessBookingCouponsService(businessId, includeArchived);
  return c.json({
    status: 200,
    data: coupons,
    message: "Coupons fetched",
  });
};

export const getBookingCouponByIdController = async (c: Context) => {
  const { couponId } = c.req.param();
  const coupon = await getBookingCouponByIdService(couponId);
  return c.json({ status: 200, data: coupon, message: "Coupon fetched" });
};

export const archiveBookingCouponsController = async (c: Context) => {
  const { couponIds } = (await c.req.json()) as { couponIds: string[] };
  const archived = await runInTransaction((session) =>
    archiveBookingCouponsService(couponIds, session)
  );
  return c.json({
    status: 200,
    data: archived,
    message: "Coupons archived and booking‑configs resynchronized.",
  });
};

// get booking coupon report
export const getBookingCouponReportController = async (c: Context) => {
  const { couponId } = c.req.param();
  const report = await getBookingCouponReportService(couponId);
  return c.json({
    status: 200,
    data: report,
    message: "Coupon report generated successfully.",
  });
};