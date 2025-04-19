
import { Hono } from "hono";
import { z } from "zod";
import {
  bookingCouponCreateSchema,
  bookingCouponUpdateSchema,
  mongoIdZod,
  zJsonValidator,
  zParamsValidator,
  zQueryValidator,
} from "@hi/db-models";
import {
  archiveBookingCouponsController,
  createBookingCouponController,
  getBookingCouponByIdController,
  getBookingCouponReportController,
  getBusinessBookingCouponsController,
  updateBookingCouponController,
} from "@/controllers/bookingz/coupon";

export const couponRouter = new Hono();

// 1) Create a coupon for a business
//    POST /bookingz/coupon/business/:businessId
couponRouter.post(
  "/business/:businessId",
  zParamsValidator(z.object({ businessId: mongoIdZod })),
  zJsonValidator(bookingCouponCreateSchema),
  createBookingCouponController,
);

// 2) List all coupons for a business
//    GET  /bookingz/coupon/business/:businessId
couponRouter.get(
  "/business/:businessId",
  zParamsValidator(z.object({ businessId: mongoIdZod })),
  zQueryValidator(
    z.object({
      includeArchived: z
        .string()
        .optional()
        .transform((str) => str === "true")
    })
  ),
  getBusinessBookingCouponsController,
);

// 3) Get a single coupon by its ID
//    GET  /bookingz/coupon/:couponId
couponRouter.get(
  "/:couponId",
  zParamsValidator(z.object({ couponId: mongoIdZod })),
  getBookingCouponByIdController,
);

// 4) Update a coupon
//    PATCH /bookingz/coupon/:couponId
couponRouter.patch(
  "/:couponId",
  zParamsValidator(z.object({ couponId: mongoIdZod })),
  zJsonValidator(bookingCouponUpdateSchema),
  updateBookingCouponController,
);

// 5) Batch‑archive coupons
//    PATCH /bookingz/coupon/archive
couponRouter.delete(
  "/archive",
  zJsonValidator(
    z.object({
      couponIds: z
        .array(mongoIdZod)
        .min(1, { message: "At least one coupon ID is required" })
        .refine((ids) => new Set(ids).size === ids.length, {
          message: "Duplicate coupon IDs not allowed",
        }),
    })
  ),
  archiveBookingCouponsController,
);

// 6) Get coupon report
//    GET /bookingz/coupon/:couponId/report
couponRouter.get(
  "/:couponId/report",
  zParamsValidator(z.object({ couponId: mongoIdZod })),
  getBookingCouponReportController,
);
