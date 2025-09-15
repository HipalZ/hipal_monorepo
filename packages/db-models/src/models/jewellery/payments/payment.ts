import mongoose, { type Model } from "mongoose";
import autoIncrement from "mongoose-auto-increment";
import type { JewelleryPaymentType } from "../../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
autoIncrement.initialize(mongoose.connection);
const jewelleryPaymentSchema = new mongoose.Schema<JewelleryPaymentType>(
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
      default: Date.now(),
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

    orderId: {
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

    earnCoins: {
      type: Number,
      default: 0,
      required: false,
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

    settleType: {
      type: String,
      enum: [
        "NORMAL_SETTLE",
        "HI_SETTLE",
        "PAYMENT_GATEWAY",
        "DUES_SETTLE",
        "NPC_SETTLE",
        "COMPLIMENTARY_SETTLE",
      ],
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

    couponDiscount: {
      type: Number,
      default: 0,
    },
    billItems: {
      type: [Object],
      required: false,
      default: [],
    },

    billInvoice: {
      type: Number,
      default: 0,
    },
    // isSplit: {
    //   type: Boolean,
    //   required: false,
    //   default: false,
    // },
    // isSplitBillVariant: {
    //   type: Boolean,
    //   required: false,
    //   default: false,
    // },
  },

  { timestamps: true },
);

jewelleryPaymentSchema.plugin(autoIncrement.plugin, {
  model: "jewellerypayment",
  field: "billInvoice", // <-- Will be added automatically
  startAt: 1,
  incrementBy: 1,
});

const JewelleryPayment: Model<JewelleryPaymentType> =
  mongoose.model<JewelleryPaymentType>(
    "jewellerypayment",
    jewelleryPaymentSchema,
  );

export { JewelleryPayment };
