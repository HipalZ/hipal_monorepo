import mongoose, { type Model } from "mongoose";
import type { PaymentAlertType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const paymentAlertSchema = new mongoose.Schema<PaymentAlertType>(
  {
    businessId: { type: ObjectId, required: true, ref: "Business" },
    comment: { type: String, default: null },
    status: { type: String, default: null },
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    alertType: {
      type: String,
      enum: ["ONLINE", "OFFLINE", "WAITER"],
      required: true,
    },
    order_id: { type: ObjectId, required: false, ref: "Order", unique: true },

    isAccepted: { type: Boolean, default: false },
    message: { type: String, default: null },

    isRejected: { type: Boolean, default: false },
    errorReason: { type: String, default: null },
    tableName: { type: String, required: true },
    errorDescription: { type: String, default: null },
    posDiscount: { type: Number, default: 0 },
    waiterName: { type: String, default: null },
    coinsApplied: { type: Boolean, default: false },
    date: { type: Number },
  },
  {
    timestamps: true,
  },
);

const PaymentAlert: Model<PaymentAlertType> = mongoose.model<PaymentAlertType>(
  "PaymentAlert",
  paymentAlertSchema,
);

export { PaymentAlert };
