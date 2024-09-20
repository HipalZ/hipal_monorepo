import mongoose, { type Model } from "mongoose";
import type { CouponViewType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const couponViewSchema = new mongoose.Schema<CouponViewType>(
  {
    couponId: {
      type: ObjectId,
      required: true,
      ref: "Coupon",
      index: true,
    },

    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },

    date: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const CouponView: Model<CouponViewType> = mongoose.model<CouponViewType>(
  "CouponView",
  couponViewSchema,
);

export { CouponView };
