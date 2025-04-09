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

    settleType: {
      type: String,
      enum: [
        "NORMAL_SETTLE",
        "HI_SETTLE",
        "FORCE_SETTLE",
        "PAYMENT_GATEWAY",
        "FREE_SETTLE",
        "DUES_SETTLE",
        "NPC_SETTLE",
        "COMPLIMENTARY_SETTLE",
      ],
      required: false,
    },
    comment: {
      type: String,
      required: false,
    },
    tax: {
      type: Number,
      required: false,
      default: 0,
    },
    serviceCharge: {
      type: Number,
      required: false,
      default: 0,
    },
    posBillRequestId: {
      type: String,
      required: false,
    },
    splitModes: [
      {
        name: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        _id: {
          type: ObjectId,
          required: true,
          ref: "upimode",
        },
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    initialTax: {
      type: Number,
      default: 0,
    },

    initialSubTotal: {
      type: Number,
      default: 0,
    },
    initialTotal: {
      type: Number,
      default: 0,
    },
    finalSubTotal: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["COINZ", "COUPONZ"],
      required: false,
      default: "COINZ",
    },

    downloadUrl: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  { timestamps: true },
);

const Payment: Model<PaymentType> = mongoose.model<PaymentType>(
  "Payment",
  paymentSchema,
);

export { Payment };
