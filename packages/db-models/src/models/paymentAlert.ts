import mongoose, { type Model } from "mongoose";
import type { PaymentAlertType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const paymentAlertSchema = new mongoose.Schema<PaymentAlertType>(
  {
    businessId: { type: ObjectId, required: true, ref: "Business" },
    comment: { type: String, default: "" },
    status: { type: String, default: null },
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    alertType: {
      type: String,
      enum: ["ONLINE", "OFFLINE", "WAITER", "FORCE_SETTLE", "NORMAL_SETTLE"],
      required: true,
    },
    order_id: { type: ObjectId, required: false, ref: "Order" },

    isAccepted: { type: Boolean, default: false },
    message: { type: String, default: "" },

    isRejected: { type: Boolean, default: false },
    errorReason: { type: String, default: null },
    tableName: { type: String, required: true },
    errorDescription: { type: String, default: null },
    posDiscount: { type: Number, default: 0 },
    waiterName: { type: String, default: null },
    coinsApplied: { type: Boolean, default: false },
    date: { type: Number },
    posBillRequestId: { type: String, default: null },
    hiCode: { type: String, default: "" },
    mode: { type: String, default: "" },
    appUrl: { type: String, default: "" },
    v: { type: Number },
  },
  {
    timestamps: true,
  },
);
paymentAlertSchema.index({ status: 1, order_id: 1 }, { unique: true });

const PaymentAlert: Model<PaymentAlertType> = mongoose.model<PaymentAlertType>(
  "PaymentAlert",
  paymentAlertSchema,
);

export { PaymentAlert };
