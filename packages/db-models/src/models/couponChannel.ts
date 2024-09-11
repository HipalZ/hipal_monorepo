import mongoose, { type Model } from "mongoose";
import type { CouponChannelType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const couponChannelSchema = new mongoose.Schema<CouponChannelType>(
  {
    businessId: {
      required: true,
      type: ObjectId,
      ref: "Business",
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },

    date: {
      type: Number,
    },
    count: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const CouponChannel: Model<CouponChannelType> =
  mongoose.model<CouponChannelType>("couponChannel", couponChannelSchema);

export { CouponChannel };
