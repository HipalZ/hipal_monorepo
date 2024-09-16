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
    couponIds: [
      {
        type: ObjectId,
        ref: "COUPONZ",
      },
    ],
  },
  {
    timestamps: true,
  },
);

couponChannelSchema.index({ businessId: 1, name: 1 }, { unique: true });

const CouponChannel: Model<CouponChannelType> =
  mongoose.model<CouponChannelType>("couponChannel", couponChannelSchema);

export { CouponChannel };
