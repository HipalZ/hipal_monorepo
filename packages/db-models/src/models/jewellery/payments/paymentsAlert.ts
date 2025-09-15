import mongoose, { type Model } from "mongoose";
import type { JewelleryPaymentAlertType } from "../../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const jewelleryPaymentAlertSchema =
  new mongoose.Schema<JewelleryPaymentAlertType>(
    {
      businessId: { type: ObjectId, required: true, ref: "Business" },
      status: { type: String, default: null },
      userId: {
        type: ObjectId,
        required: true,
        ref: "User",
      },
      alertType: {
        type: String,
        enum: ["ONLINE", "OFFLINE", "WAITER", "NORMAL_SETTLE"],
        required: true,
      },
      orderId: { type: ObjectId, required: false, ref: "Order" },

      isAccepted: { type: Boolean, default: false },
      message: { type: String, default: "" },

      isRejected: { type: Boolean, default: false },
      errorReason: { type: String, default: null },
      errorDescription: { type: String, default: null },
      waiterName: { type: String, default: null },
      coinsApplied: { type: Boolean, default: false },
      date: { type: Number },
      mode: { type: String, default: "" },
    },
    {
      timestamps: true,
    },
  );
// jewelleryPaymentAlertSchema.index({ status: 1, order_id: 1 }, { unique: true });

const JewelleryPaymentAlert: Model<JewelleryPaymentAlertType> =
  mongoose.model<JewelleryPaymentAlertType>(
    "jewelleryPaymentAlert",
    jewelleryPaymentAlertSchema,
  );

export { JewelleryPaymentAlert };
