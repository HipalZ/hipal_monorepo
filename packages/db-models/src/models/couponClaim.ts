import mongoose, { type Model } from "mongoose";

import type { CouponClaimType } from "../validators";

const { Schema } = mongoose;

const CouponClaimSchema = new Schema<CouponClaimType>({
  couponId: {
    type: Schema.Types.ObjectId,
    ref: "COUPONZ",
    required: true,
  },

  overAllLimit: {
    type: Number,
    default: 0,
  },
  weeklyLimit: {
    type: Number,
    default: 0,
  },
  monthlyLimit: {
    type: Number,
    default: 0,
  },
  date: {
    type: Number,
  },
});

CouponClaimSchema.index({ couponId: 1 }, { unique: true });

const CouponClaim: Model<CouponClaimType> = mongoose.model<CouponClaimType>(
  "couponclaim",
  CouponClaimSchema,
);

export { CouponClaim };
