import mongoose, { Model } from 'mongoose';
import { UserBillType } from '../validators';

const userBillSchema = new mongoose.Schema<UserBillType>(
  {
    businessId: {
      required: true,
      type: String,
    },
    tableId: {
      required: true,
      type: String,
    },

    time: {
      type: String,
    },
    bill: {
      type: [],
    },
    zoneId: String,
    date: String,
  },
  {
    timestamps: true,
  },
);

const Userbill: Model<UserBillType> = mongoose.model<UserBillType>('userbill', userBillSchema);

export { Userbill };
