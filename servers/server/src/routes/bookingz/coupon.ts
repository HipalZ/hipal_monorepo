import { Hono } from "hono";
import { z } from "zod";
import {
  bookingCouponCreateSchema,
  bookingCouponUpdateSchema,
  mongoIdZod,
  zJsonValidator,
  zParamsValidator,
} from "@hi/db-models";
import {
  createBookingCouponController,
  getBookingCouponByIdController,
  getBusinessBookingCouponsController,
  updateBookingCouponController,
} from "@/controllers/bookingz/coupon";

export const couponRouter = new Hono();

// 1) Create
couponRouter.post(
  "/:businessId",
  zParamsValidator(z.object({ businessId: mongoIdZod })),
  zJsonValidator(bookingCouponCreateSchema),
  createBookingCouponController,
);

// 2) Update
couponRouter.patch(
  "/:couponId",
  zParamsValidator(z.object({ couponId: mongoIdZod })),
  zJsonValidator(bookingCouponUpdateSchema),
  updateBookingCouponController,
);

// get all for a business
couponRouter.get(
  "/business/:businessId",
  zParamsValidator(z.object({ businessId: mongoIdZod })),
  getBusinessBookingCouponsController,
);

// get one by id
couponRouter.get(
  "/:couponId",
  zParamsValidator(z.object({ couponId: mongoIdZod })),
  getBookingCouponByIdController,
);
