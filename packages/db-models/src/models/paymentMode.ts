import mongoose, { Model } from 'mongoose';

import { PaymentModeType } from '../validators';

const paymentModeSchema = new mongoose.Schema<PaymentModeType>(
  {
    businessId: {
      required: false,
      type: String,
    },
    mode: String,
    commission: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const PaymentMode: Model<PaymentModeType> = mongoose.model<PaymentModeType>('paymentmode', paymentModeSchema);

export { PaymentMode };
