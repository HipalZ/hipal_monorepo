import mongoose, { type Model } from "mongoose";
import type { JewelleryOrderTypeValidator } from "../../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema<JewelleryOrderTypeValidator>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
      index: true,
    },
    total: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true },
    billValue: { type: Number, required: true },
    receipt: { type: String, required: true, unique: true },
    userId: { type: ObjectId, required: true, ref: "User" },
    tips: { type: Number, default: 0 },
    claimedCoins: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    order_id: { type: String, required: true, unique: true },
    couponId: { type: ObjectId, ref: "COUPONZ" },
    cashbackAvailable: { type: Boolean, default: true },
    date: { type: Number, required: true },
    couponDiscount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const JewelleryOrder: Model<JewelleryOrderTypeValidator> =
  mongoose.model<JewelleryOrderTypeValidator>("jewelleryOrder", orderSchema);

export { JewelleryOrder };
