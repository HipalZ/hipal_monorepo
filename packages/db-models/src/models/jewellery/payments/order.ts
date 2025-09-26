import mongoose, { type Model } from "mongoose";
import type { JewelleryOrderTypeValidator } from "../../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const jewelleryOrderSchema = new mongoose.Schema<JewelleryOrderTypeValidator>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    total: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "INR" },
    subTotal: { type: Number, required: true, default: 0 },
    userId: { type: ObjectId, required: true, ref: "User" },
    tips: { type: Number, default: 0 },
    claimedCoins: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponId: { type: ObjectId, ref: "COUPONZ" },
    date: { type: Number, required: true },
    couponDiscount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    isCoinApplied: { type: Boolean, default: false },
    isCouponApplied: { type: Boolean, default: false },
    isDiscountApplied: { type: Boolean, default: false },
    coinAppliedPercent: { type: Number, default: 0 },
    couponAppliedPercent: { type: Number, default: 0 },
    discountAppliedPercent: { type: Number, default: 0 },
    razorpayOrderId: { type: String, default: null, unique: true },
    staffId: { type: ObjectId, ref: "User", default: null },
    isPaid: { type: String, default: "IN_PROGRESS" },
  },
  {
    timestamps: true,
  },
);

const JewelleryOrder: Model<JewelleryOrderTypeValidator> =
  mongoose.model<JewelleryOrderTypeValidator>(
    "jewelleryOrder",
    jewelleryOrderSchema,
  );

export { JewelleryOrder };
