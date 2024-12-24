import mongoose, { type Model } from "mongoose";
import type { PaymentType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const paymentSchema = new mongoose.Schema<PaymentType>(
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

    tableName: {
      type: String,
      required: true,
    },
    order_id: {
      type: ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    tips: {
      type: Number,
      default: 0,
      required: false,
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
    claimedCoins: {
      type: Number,
      default: 0,
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
    waiterName: {
      type: String,
      required: false,
    },
    posBillId: {
      type: String,
    },

    earnCoins: {
      type: Number,
      default: 0,
      required: false,
    },
    tagIds: {
      type: [ObjectId],
      required: false,
      ref: "Tag",
    },
    couponId: {
      type: ObjectId,
      required: false,
      ref: "COUPONZ",
    },

    reviewId: {
      type: ObjectId,
      required: false,
      ref: "customerReviews",
    },
    channelId: {
      type: ObjectId,
      required: false,
      ref: "CouponChannel",
    },
  },

  { timestamps: true },
);

const Payment: Model<PaymentType> = mongoose.model<PaymentType>(
  "Payment",
  paymentSchema,
);

export { Payment };
