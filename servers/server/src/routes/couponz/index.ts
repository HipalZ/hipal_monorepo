import { Couponz } from "@hi/db-models";
import { couponSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { respond } from "../../utils/response";
const couponzRouter = new Hono()
  .get("/", async (c) => {
    return c.json(
      {
        message: "Welcome to the couponz route",
        err: false,
        data: {},
      },
      200,
    );
  })
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
      requestData.conditions.couponEndDate
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
  });

export default couponzRouter;
