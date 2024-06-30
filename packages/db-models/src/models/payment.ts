import mongoose, { Model } from 'mongoose';
import { PaymentType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;

// const paymentItemSchema = new mongoose.Schema<PaymentItemType>(
//   {
//     name: {
//       required: true,
//       type: String,
//     },
//     quantity: {
//       required: true,
//       type: Number,
//     },
//     amount: {
//       required: true,
//       type: Number,
//     },
//     portions: {
//       required: false,
//       type: Object,
//     },
//     extras: {
//       required: false,
//       type: Object,
//     },
//     category: {
//       required: false,
//       type: String,
//     },
//     comments: {
//       required: false,
//       type: String,
//     },
//   },
//   { timestamps: true },
// );

// const paymentSwiggyBillObjSchema = new mongoose.Schema<PaymentSwiggyBillObjType>(
//   {
//     totalItems: {
//       required: true,
//       type: Number,
//     },
//     subTotal: {
//       required: true,
//       type: Number,
//     },
//     packingCharges: {
//       required: true,
//       type: Number,
//     },
//     RxPayableGST: {
//       required: true,
//       type: Number,
//     },
//     swiggyPayableGST: {
//       required: true,
//       type: Number,
//     },
//     discount: {
//       required: true,
//       type: Number,
//     },
//     totalPrice: {
//       required: true,
//       type: Number,
//     },
//   },
//   { timestamps: true },
// );

const paymentSchema = new mongoose.Schema<PaymentType>(
  {
    businessId: {
      required: false,
      type: ObjectId,
      index: true,
      ref: 'Business',
    },

    date: {
      required: false,
      type: Number,
      default: Date.now(),
    },

    total: {
      required: true,
      type: Number,
      default: 0,
    },

    customerName: {
      required: false,
      type: String,
    },
    customerPhone: {
      required: false,
      type: String,
    },

    mode: {
      required: false,
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
    },
    order_id: {
      type: ObjectId,
      ref: 'Order',
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
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true },
);

const Payment: Model<PaymentType> = mongoose.model<PaymentType>('Payment', paymentSchema);

export { Payment };
