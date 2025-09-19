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
      ref: "Business",
    },

    date: {
      required: true,
      type: Number,
      default: Date.now(),
    },

    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },

    mode: {
      required: true,
      type: String,
    },
    paymentMode: {
      required: true,
      type: String,
    },

    orderId: {
      type: ObjectId,
      ref: "jewelleryOrder",
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

    earnCoins: {
      type: Number,
      default: 0,
      required: false,
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

    downloadUrl: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
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
