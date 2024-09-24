import type { Model } from "mongoose";
import mongoose from "mongoose";
import {
  AVAILABILITY,
  COUPONZ_TYPES,
  type CouponzLimitType,
  type CouponzType,
  DAYS,
  DISCOUNT_TYPES,
} from "../validators/couponz";
const ObjectId = mongoose.Schema.Types.ObjectId;

const { Schema } = mongoose;

const couponConfigSchema = new Schema({
  value: {
    type: Number,
    required: false,
  },
  discountType: {
    type: String,
    enum: DISCOUNT_TYPES,
    required: true,
  },
  upto: {
    type: Number,
    required: false,
  },
  min: {
    type: Number,
    required: false,
  },
  max: {
    type: Number,
    required: false,
  },
  steps: [
    new Schema({
      count: {
        type: Number,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      discountType: {
        type: String,
        enum: DISCOUNT_TYPES,
        required: true,
      },
      upto: {
        type: Number,
        required: false,
      },
    }),
  ],
});

const limitSchema = new Schema<CouponzLimitType>({
  overAllLimit: {
    type: Number,
    required: false,
  },
  weeklyLimit: {
    type: Number,
    required: false,
  },
  monthlyLimit: {
    type: Number,
    required: false,
  },
});

const couponSchema = new mongoose.Schema<CouponzType>({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: COUPONZ_TYPES,
    required: true,
  },
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
  config: couponConfigSchema,
  isActive: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    required: false,
  },
  bgColour: {
    type: String,
    required: false,
  },
  isPublish: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  cashbackAvailable: {
    type: Boolean,
    default: true,
  },
  promote: {
    type: Boolean,
    default: false,
  },
  promoteOnBill: {
    type: Boolean,
    default: false,
  },
  conditions: new Schema({
    individualUserLimit: limitSchema,
    billValue: {
      type: Number,
      required: false,
    },
    expiryClaimLimit: limitSchema,
    availability: new Schema({
      when: {
        type: String,
        enum: AVAILABILITY,
        required: false,
        default: "custom",
      },
      customDays: {
        type: [String],
        enum: DAYS,
        required: false,
      },
      startTime: {
        type: Number,
        required: false,
        default: 0,
      },
      endTime: {
        type: Number,
        required: false,
        default: 24,
      },
    }),
    eligibleUser: new Schema({
      allUsers: {
        type: Boolean,
        default: true,
      },
      userIds: {
        type: [ObjectId],
        default: [],
        index: true,
        ref: "User",
      },
      groupIds: {
        type: [ObjectId],
        default: [],
        index: true,
        ref: "Group",
      },
    }),
    expiryAfterGrabbed: {
      type: Number,
      required: false,
      default: 0,
    },
    requiredFields: {
      type: [String],
      required: false,
    },
    couponStartDate: {
      type: Number,
      default: 0,

      required: true,
    },
    couponEndDate: {
      type: Number,
      default: 0,
      required: true,
    },

    tc: {
      type: [String],
    },
  }),
});

const Couponz: Model<CouponzType> = mongoose.model<CouponzType>(
  "COUPONZ",
  couponSchema,
);

export { Couponz };
