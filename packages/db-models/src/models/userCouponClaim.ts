import mongoose, { type Model } from "mongoose";

import type { UserCouponClaimType } from "../validators";

const { Schema } = mongoose;

const userCouponClaimSchema = new Schema<UserCouponClaimType>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
  weekelyLastResetDate: {
    type: Number,
    default: 0,
  },
  monthlyLastResetDate: {
    type: Number,
    default: 0,
  },
});

userCouponClaimSchema.index({ userId: 1, couponId: 1 }, { unique: true });

const UserCouponClaim: Model<UserCouponClaimType> =
  mongoose.model<UserCouponClaimType>("usercouponclaim", userCouponClaimSchema);

export { UserCouponClaim };
