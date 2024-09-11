import mongoose, { type Model } from "mongoose";
import type { CouponViewType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const couponViewSchema = new mongoose.Schema<CouponViewType>(
  {
    businessId: {
      required: true,
      type: ObjectId,
      ref: "Business",
    },
    couponId: {
      type: ObjectId,
      required: true,
      ref: "Coupon",
      index: true,
    },
    date: {
      type: Number,
    },
    count: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);
couponViewSchema.index({ businessId: 1, couponId: 1 }, { unique: true });

const CouponView: Model<CouponViewType> = mongoose.model<CouponViewType>(
  "CouponView",
  couponViewSchema,
);

export { CouponView };
