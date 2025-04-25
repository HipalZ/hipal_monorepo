import { z } from "zod";

const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const COUPONZ_TYPES = ["FIX", "RANDOM", "LIMITED", "BOOKINGS"] as const;
export const DISCOUNT_TYPES = ["PERCENTAGE", "AMOUNT"] as const;
export const AVAILABILITY = [
  "allthetime",
  "weekdays",
  "weekends",
  "birthday",
  "birthdayweek",
  "birthdaymonth",
  "custom",
] as const;

export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type CouponzDays = (typeof DAYS)[number];
export type CouponzAvailability = (typeof AVAILABILITY)[number];
export type CouponzDiscountType = (typeof DISCOUNT_TYPES)[number];

export const positiveNumber = (field: string) =>
  z.coerce.number({
    message: `${field} is required`,
  });

export const couponConfigSchema = z.union([
  z.object({
    value: positiveNumber("value"),
    discountType: z.enum(DISCOUNT_TYPES, {
      message: "discountType should be one of PERCENTAGE, AMOUNT",
    }),
    upto: positiveNumber("upto").optional(),
  }),
  z.object({
    min: positiveNumber("min"),
    max: positiveNumber("max"),
    discountType: z.enum(DISCOUNT_TYPES, {
      message: "discountType should be one of PERCENTAGE, AMOUNT",
    }),
    upto: positiveNumber("upto").optional(),
  }),
  z.object({
    steps: z.array(
      z.object({
        count: positiveNumber("count"),
        value: positiveNumber("value"),
        discountType: z.enum(DISCOUNT_TYPES, {
          message: "discountType should be one of PERCENTAGE, AMOUNT",
        }),
        upto: positiveNumber("upto").optional(),
      }),
    ),
  }),
]);

export const availabilitySchema = z.object({
  when: z
    .enum(AVAILABILITY, {
      message:
        "availability should be one of allthetime, weekdays, weekends, birthday, birthdayweek, birthdaymonth, custom",
    })
    .optional(),
  customDays: z
    .array(
      z.enum(DAYS, {
        message:
          "customDays should be one of monday, tuesday, wednesday, thursday, friday, saturday, sunday",
      }),
    )
    .optional(),
  startTime: positiveNumber("startTime"),
  endTime: positiveNumber("endTime"),
});

export const bookingMetaSchema = z.object({
  baseCharge: positiveNumber("baseCharge").optional(),
  redeemableCoverCharge: positiveNumber("redeemableCoverCharge").optional(),
  minGuests: positiveNumber("minGuests").optional(),
});

export const limitSchema = z.union([
  z
    .object({
      overAllLimit: positiveNumber("overAllLimit"),
    })
    .optional(),
  z
    .object({
      weeklyLimit: positiveNumber("weeklyLimit"),
    })
    .optional(),
  z
    .object({
      monthlyLimit: positiveNumber("monthlyLimit"),
    })
    .optional(),
]);

export const condtionSchema = z.object({
  individualUserLimit: limitSchema.optional(),
  billValue: positiveNumber("billValue").default(0).optional(),
  expiryClaimLimit: limitSchema.optional(),
  availability: z.object({
    when: z
      .enum(AVAILABILITY, {
        message:
          "availability should be one of allthetime, weekdays, weekends, birthday, birthdayweek, birthdaymonth, custom",
      })
      .optional(),
    customDays: z
      .array(
        z.enum(DAYS, {
          message:
            "customDays should be one of monday, tuesday, wednesday, thursday, friday, saturday, sunday",
        }),
      )
      .optional(),
    startTime: positiveNumber("startTime"),
    endTime: positiveNumber("endTime"),
  }),
  eligibleUser: z.object({
    allUsers: z.boolean().default(false),
    userIds: z.array(ObjectIdSchema).default([]),
    groupIds: z.array(ObjectIdSchema).default([]),
  }),
  expiryAfterGrabbed: positiveNumber("expiryAfterGrabbed").optional(),
  requiredFields: z
    .array(
      z.string({
        message: "requiredFields should be an array of strings",
      }),
    )
    .optional(),
  couponStartDate: positiveNumber("couponStartDate"),
  couponEndDate: positiveNumber("couponEndDate"),
  tc: z.array(z.string()).optional(),
});

export const couponSchema = z.object({
  name: z
    .string({
      message: "Coupon name should be a string",
    })
    .min(2, {
      message: "Coupon name should be at least 2 characters",
    })
    .max(100, {
      message: "Coupon name should be at most 100 characters",
    }),
  type: z.enum(COUPONZ_TYPES, {
    message: "Coupon type should be one of FIX, RANDOM, LIMITED",
  }),
  promote: z.boolean().default(false),
  promoteOnBill: z.boolean().default(false),
  businessId: ObjectIdSchema,
  config: couponConfigSchema,
  bookingMeta: bookingMetaSchema.optional(),
  isActive: z.boolean().default(false),
  bgColour: z.string().optional(),
  isPublish: z.boolean().default(true),
  cashbackAvailable: z.boolean().default(true),
  image: z
    .string()
    .url()
    .min(10, {
      message: "Image url should be at least 10 characters",
    })
    .max(200, {
      message: "Image url should be at most 200 characters",
    })
    .optional(),
  isDeleted: z.boolean().default(false),
  isExpired: z.boolean().default(false),
  dineIn: z.boolean().default(false),
  conditions: z.object({
    individualUserLimit: limitSchema.optional(),
    billValue: positiveNumber("billValue").optional(),
    expiryClaimLimit: limitSchema.optional(),
    availability: z.object({
      when: z
        .enum(AVAILABILITY, {
          message:
            "availability should be one of allthetime, weekdays, weekends, birthday, birthdayweek, birthdaymonth, custom",
        })
        .optional(),
      customDays: z
        .array(
          z.enum(DAYS, {
            message:
              "customDays should be one of mon, tue, wed, thu, fri, sat, sun",
          }),
        )
        .optional(),
      startTime: z.number().default(0),
      endTime: positiveNumber("endTime"),
    }),
    eligibleUser: z.object({
      allUsers: z.boolean().default(false),
      userIds: z.array(ObjectIdSchema).default([]),
      groupIds: z.array(ObjectIdSchema).default([]),
    }),
    expiryAfterGrabbed: positiveNumber("expiryAfterGrabbed").optional(),
    requiredFields: z
      .array(
        z.string({
          message: "requiredFields should be an array of strings",
        }),
      )
      .optional(),
    couponStartDate: positiveNumber("couponStartDate"),
    couponEndDate: positiveNumber("couponEndDate"),
    tc: z.array(z.string()).optional(),
  }),
});

export type CouponzType = z.infer<typeof couponSchema>;
export type CouponzConfigType = z.infer<typeof couponConfigSchema>;
export type CouponzLimitType = z.infer<typeof limitSchema>;
export type CouponzConditionType = z.infer<typeof condtionSchema>;
export type CouponzAvailabilityType = z.infer<typeof availabilitySchema>;
