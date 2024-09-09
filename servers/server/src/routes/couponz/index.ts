import { Couponz } from "@hi/db-models";
import { couponSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";
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
      const coupon = await Couponz.findOne({ _id: couponId, isDeleted: false });
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

    // Validation 2: Ensure only one of availability.when or availability.customDays is chosen
    if (
      requestData.conditions.availability.when &&
      requestData.conditions.availability.customDays
    ) {
      return respond(
        c,
        "Only one of availability.when or availability.customDays should be chosen",
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

      // Validation 2: Ensure only one of availability.when or availability.customDays is chosen
      if (
        requestData?.conditions?.availability?.when &&
        requestData?.conditions?.availability?.customDays
      ) {
        return respond(
          c,
          "Only one of availability.when or availability.customDays should be chosen",
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
    "/eligible-coupons/:userId",
    zValidator(
      "param",
      z.object({
        userId: z.string({ message: "userId should be a string" }),
      }),
    ),
    async (c) => {
      const { userId } = c.req.param();
      const currentDate = Date.now();

      // Fetch all active coupons
      const coupons = await Couponz.find({
        "conditions.couponStartDate": { $lte: currentDate },
        "conditions.couponEndDate": { $gte: currentDate },
        isDeleted: false,
      });

      const eligibleCoupons = [];

      for (const coupon of coupons) {
        const { conditions } = coupon;

        // Check availability
        const currentDay = new Date()
          .toLocaleString("en-us", { weekday: "long" })
          .toLowerCase();
        const currentTime = new Date().getHours();
        if (conditions.availability.when === "custom") {
          if (!conditions.availability.customDays.includes(currentDay)) {
            continue; // Not eligible based on customDays
          }
        }
        if (
          conditions.availability.startTime &&
          conditions.availability.endTime
        ) {
          if (
            currentTime < conditions.availability.startTime ||
            currentTime > conditions.availability.endTime
          ) {
            continue; // Not eligible based on time
          }
        }

        // Check eligibility
        if (!conditions.eligibleUser.allUsers) {
          if (!conditions.eligibleUser.userIds.includes(userId)) {
            // If userId is not in eligible user list, skip
            continue;
          }
        }

        // Check user claim limits
        const userClaim = await UserCouponClaim.findOne({
          userId,
          couponId: coupon._id,
        });

        if (userClaim) {
          if (
            userClaim.overAllLimit >=
            conditions.individualUserLimit.overAllLimit
          ) {
            continue; // Exceeded individual user's overall limit
          }

          // Optionally check weekly/monthly limits as well
        }

        // Check global claim limits
        const globalClaim = await CouponClaim.findOne({ couponId: coupon._id });
        if (globalClaim) {
          if (
            globalClaim.overAllLimit >=
            conditions.individualUserLimit.overAllLimit
          ) {
            continue; // Exceeded global overall limit
          }

          // Optionally check weekly/monthly limits
        }

        // Check required fields (example: email, phone, etc.)
        const requiredFields = conditions.requiredFields || [];
        const user = await User.findById(userId); // Assuming you have a User model

        const missingFields = requiredFields.filter((field) => !user[field]);
        if (missingFields.length > 0) {
          continue; // User is missing required fields
        }

        eligibleCoupons.push(coupon);
      }

      return c.json({ eligibleCoupons });
    },
  );

export default couponzRouter;
