import mongoose, { type Model } from "mongoose";
import type { WhatsAppPaymentType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppPaymentSchema = new mongoose.Schema<WhatsAppPaymentType>(
  {
    businessId: {
      required: true,
      type: ObjectId,
      index: true,
      ref: "Business",
    },

    date: {
      required: true,
      type: Number,
    },

    total: {
      required: true,
      type: Number,
      default: 0,
    },

    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    mode: {
      required: true,
      type: String,
    },
    paymentMode: {
      required: true,
      type: String,
    },
    billValue: {
      required: true,
      type: Number,
      default: 0,
    },

    order_id: {
      type: ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpayAcquirerData: {
      type: Object,
      default: {},
    },
    razorpayEventId: {
      type: String,
      required: true,
      unique: true,
    },
  },

  { timestamps: true },
);

const WhatsAppPayment: Model<WhatsAppPaymentType> =
  mongoose.model<WhatsAppPaymentType>("WhatsAppPayment", whatsAppPaymentSchema);

export { WhatsAppPayment };
