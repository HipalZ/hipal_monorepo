import mongoose, { type Model } from "mongoose";
import type { PaymentType } from "../validators";
import { BillInvoiceNumber } from "./billInvoiceNumber";
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
    updatedAt: {
      type: Number,
      required: false,
      default: 0,
    },
    updatedBy: {
      type: ObjectId,
      required: false,
      ref: "User",
    },
    billId: {
      type: String,
      required: false,
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
    pin: {
      type: String,
      required: false,
    },
    billRequestId: {
      type: String,
      required: false,
    },
    billInvoice: {
      type: Number,
      default: 0,
    },
    isSplit: {
      type: Boolean,
      required: false,
      default: false,
    },
    isSplitBillVariant: {
      type: Boolean,
      required: false,
      default: false,
    },
    coinAppliedBy: {
      type: ObjectId,
      ref: "User",
      default: null,
    },

    billNo: {
      type: Number,
      required: false,
    },
    paxCount: {
      type: Number,
      required: false,
      default: 0,
    },
    serviceChargePercentage: {
      type: Number,
      required: false,
      default: 0,
    },
  },

  { timestamps: true },
);

paymentSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Increment or create bill counter for this business
    const counter = await BillInvoiceNumber.findOneAndUpdate(
      { businessId: this.businessId },
      { $inc: { billInvoiceNumber: 1 } },
      { upsert: true, new: true, session },
    );

    // Assign incremented value to billInvoice
    this.billNo = counter.billInvoiceNumber;

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error("Error generating billInvoice:", err);
  } finally {
    session.endSession();
    next();
  }
});

const Payment: Model<PaymentType> = mongoose.model<PaymentType>(
  "Payment",
  paymentSchema,
);

export { Payment };
