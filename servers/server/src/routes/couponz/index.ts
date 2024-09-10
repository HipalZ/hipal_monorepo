import { Couponz } from "@hi/db-models";
import {
  type CouponzAvailabilityType,
  type CouponzDays,
  couponSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const weekends = ["saturday", "sunday"];
// Helper function to determine day eligibility
function switchDayEligibility(
  availability: CouponzAvailabilityType,
  currentDay: string,
) {
  switch (availability.when) {
    case "allthetime":
      return true;
    case "weekdays":
      return weekdays.includes(currentDay);
    case "weekends":
      return weekends.includes(currentDay);
    case "custom":
      return availability.customDays?.includes(currentDay as CouponzDays);
    default:
      return false;
  }
}

// Helper function to determine time eligibility
function switchTimeEligibility(
  availability: CouponzAvailabilityType,
  currentTime: number,
) {
  return (
    availability.startTime == null ||
    (currentTime >= availability.startTime &&
      currentTime <= availability.endTime)
  );
}

const couponzRouter = new Hono()
  .get(
    "/all/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({
          message: "businessId should be a string",
        }),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      const coupons = await Couponz.find({
        businessId,
        isDeleted: false,
      }).select(
        "-isDeleted -__v name businessId type  config couponStartDate couponEndDate ",
      );
      return c.json(
        {
          message: "Coupons found",
          err: false,
          data: coupons,
        },
        200,
      );
    },
  )
  .get(
    "/:couponId",
    zValidator(
      "param",
      z.object({
        couponId: z.string({
          message: "CouponId should be a string",
        }),
      }),
    ),
    async (c) => {
      const { couponId } = c.req.param();
      const coupon = await Couponz.findOne({ _id: couponId });
      if (!coupon) {
        return respond(c, "Coupon not found", true, 404, {});
      }
      return c.json(
        {
          message: "Coupon found",
          err: false,
          data: coupon,
        },
        200,
      );
    },
  )
  .delete(
    "/:couponId",
    zValidator(
      "param",
      z.object({
        couponId: z.string({
          message: "CouponId should be a string",
        }),
      }),
    ),
    async (c) => {
      const { couponId } = c.req.param();
      const coupon = await Couponz.findByIdAndUpdate(couponId, {
        isDeleted: true,
      });
      if (!coupon) {
        return respond(c, "Coupon not found", true, 404, {});
      }
      return respond(c, "Coupon deleted successfully", false, 200, {});
    },
  )
  .post("/", zValidator("json", couponSchema), async (c) => {
    const requestData = await c.req.json();

    // Validation 1: If config.discountType == PERCENTAGE then value not > 100
    if (
      requestData.config.discountType === "PERCENTAGE" &&
      requestData.config.value > 100
    ) {
      return respond(
        c,
        "value cannot be greater than 100 for PERCENTAGE discountType",
        true,
        400,
        {},
      );
    }

    // Validation 3: Set couponStartDate and couponEndDate to 0 for specific availability.when values
    const noExpiryWhenValues = [
      "allthetime",
      "birthday",
      "birthdayweek",
      "birthdaymonth",
    ];
    if (noExpiryWhenValues.includes(requestData.conditions.availability.when)) {
      requestData.conditions.couponStartDate = 0;
      requestData.conditions.couponEndDate = 0;
    }

    // Validation 4: Ensure expiryAfterGrabbed is not greater than couponEndDate

    if (
      requestData.conditions.expiryAfterGrabbed >
        requestData.conditions.couponEndDate &&
      requestData.conditions.couponEndDate !== 0
    ) {
      return respond(
        c,
        "expiryAfterGrabbed cannot be greater than couponEndDate",
        true,
        400,
        {},
      );
    }

    const createdCoupon = await Couponz.create(requestData);
    return respond(c, "Coupon created successfully", false, 201, createdCoupon);
  })
  .put(
    "/:couponId",
    zValidator("json", couponSchema.partial()),
    zValidator(
      "param",
      z.object({
        couponId: z.string({
          message: "CouponId should be a string",
        }),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();
      const { couponId } = c.req.param();

      // Validation 1: If config.discountType == PERCENTAGE then value not > 100
      if (
        requestData?.config?.discountType === "PERCENTAGE" &&
        requestData?.config?.value > 100
      ) {
        return respond(
          c,
          "value cannot be greater than 100 for PERCENTAGE discountType",
          true,
          400,
          {},
        );
      }

      // Validation 3: Set couponStartDate and couponEndDate to 0 for specific availability.when values
      const noExpiryWhenValues = [
        "allthetime",
        "birthday",
        "birthdayweek",
        "birthdaymonth",
      ];
      if (
        noExpiryWhenValues?.includes(
          requestData?.conditions?.availability?.when,
        )
      ) {
        requestData.conditions.couponStartDate = 0;
        requestData.conditions.couponEndDate = 0;
      }

      // Validation 4: Ensure expiryAfterGrabbed is not greater than couponEndDate
      if (
        requestData?.conditions?.expiryAfterGrabbed >
        requestData?.conditions?.couponEndDate
      ) {
        return respond(
          c,
          "expiryAfterGrabbed cannot be greater than couponEndDate",
          true,
          400,
          {},
        );
      }

      const updateCoupon = await Couponz.findOneAndUpdate(
        { _id: couponId, isDeleted: false, isActive: false },
        requestData,
        { new: true },
      );
      if (!updateCoupon) {
        return respond(c, "Coupon not found", true, 404, {});
      }
      return respond(
        c,
        "Coupon created successfully",
        false,
        200,
        updateCoupon,
      );
    },
  )
  .get(
    "/eligible-coupons/:businessId/:userId",
    zValidator(
      "param",
      z.object({
        userId: z.string({ message: "userId should be a string" }),
        businessId: z.string({ message: "businessId should be a string" }),
      }),
    ),
    async (c) => {
      const { userId, businessId } = c.req.param();
      const currentDate = Date.now();
      const currentDay = new Date()
        .toLocaleString("en-us", { weekday: "long" })
        .toLowerCase();
      const currentTime = new Date().getHours();

      // Fetch all active coupons
      const coupons = await Couponz.find({
        $or: [
          {
            "conditions.couponStartDate": 0,
            "conditions.couponEndDate": 0,
            businessId: businessId,
          },
          {
            "conditions.couponStartDate": { $lte: currentDate },
            "conditions.couponEndDate": { $gte: currentDate },
            businessId: businessId,
          },
        ],
      });

      const eligibleCoupons = coupons.filter((coupon) => {
        const { conditions } = coupon;
        const isDayEligible = switchDayEligibility(
          conditions.availability,
          currentDay,
        );

        const isTimeEligible = switchTimeEligibility(
          conditions.availability,
          currentTime,
        );

        // Check overall day and time eligibility
        if (!isDayEligible) return false;

        // Check user eligibility
        if (conditions.eligibleUser.allUsers) {
          return true; // Coupon is available to all users
        }
        if (conditions.eligibleUser.userIds?.includes(userId)) {
          return true; // Coupon is available to this specific user
        }

        return false; // If none of the conditions match, the user is not eligible
      });

      return c.json({
        message: "Eligible coupons found",
        err: false,
        data: eligibleCoupons,
      });
    },
  )
  .get(
    "/promot-couponz/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId should be a string" }),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      const currentDate = Date.now();
      const currentDay = new Date()
        .toLocaleString("en-us", { weekday: "long" })
        .toLowerCase();
      const currentTime = new Date().getHours();

      // Fetch all active coupons
      const coupons = await Couponz.find({
        $or: [
          {
            "conditions.couponStartDate": 0,
            "conditions.couponEndDate": 0,
            businessId: businessId,
            promot: true,
          },
          {
            "conditions.couponStartDate": { $lte: currentDate },
            "conditions.couponEndDate": { $gte: currentDate },
            businessId: businessId,
            promot: true,
          },
        ],
      });

      console.log("couponstttttt", coupons);

      const promotCoupons = coupons.filter((coupon) => {
        const { conditions } = coupon;
        const isDayEligible = switchDayEligibility(
          conditions.availability,
          currentDay,
        );

        const isTimeEligible = switchTimeEligibility(
          conditions.availability,
          currentTime,
        );

        console.log("isDayEligiblefff", isDayEligible);
        console.log("isTimeEligibleffff", isTimeEligible);

        // Check overall day and time eligibility
        return isDayEligible;
      });

      return c.json({
        message: "Eligible coupons found",
        err: false,
        data: promotCoupons,
      });
    },
  );

export default couponzRouter;
