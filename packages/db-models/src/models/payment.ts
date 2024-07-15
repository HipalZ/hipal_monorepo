import mongoose, { type Model } from 'mongoose';
import type { PaymentType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;

const paymentSchema = new mongoose.Schema<PaymentType>(
  {
    businessId: {
      required: false,
      type: ObjectId,
      index: true,
      ref: 'Business',
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
      ref: 'User',
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
    },

    tableName: {
      type: String,
      required: true,
    },
    order_id: {
      type: ObjectId,
      ref: 'Order',
      required: true,
    },

    tips: {
      type: Number,
      default: 0,
    },

    razorpayPaymentId: {
      type: String,
    },

    razorpayOrderId: {
      type: String,
    },
    claimedCoins: {
      type: Number,
      default: 0,
    },

    razorpayAcquirerData: {
      type: Object,
    },
    razorpayEventId: {
      type: String,
    },
    waiterName: {
      type: String,
      required: false,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true },
);

const Payment: Model<PaymentType> = mongoose.model<PaymentType>('Payment', paymentSchema);

export { Payment };
