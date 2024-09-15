import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { CouponHistoryType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const couponHistorySchema = new mongoose.Schema<CouponHistoryType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
      index: true,
    },
    couponId: {
      type: ObjectId,
      required: true,
      ref: "COUPONZ",
    },
    couponClaimBy: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    paymentId: {
      type: ObjectId,
      required: true,
      ref: "Payment",
    },
    date: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const CouponHistory: Model<CouponHistoryType> =
  mongoose.model<CouponHistoryType>("couponHistory", couponHistorySchema);

export { CouponHistory };
