import mongoose, { type Model } from "mongoose";
import type { UserCouponGrabbType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const userCouponGrabbSchema = new mongoose.Schema<UserCouponGrabbType>(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    couponId: {
      type: ObjectId,
      required: true,
      ref: "COUPONZ",
    },

    expiryDate: {
      type: Number,
      required: true,
    },

    date: {
      type: Number,
    },
    count: {
      type: Number,
      default: 1,
    },
    channelId: {
      type: ObjectId,
      ref: "CouponChannel",
    },
    dob: {
      type: Number,
    },
    specialday: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const UserCouponGrabb: Model<UserCouponGrabbType> =
  mongoose.model<UserCouponGrabbType>("UserCouponGrabb", userCouponGrabbSchema);

export { UserCouponGrabb };
