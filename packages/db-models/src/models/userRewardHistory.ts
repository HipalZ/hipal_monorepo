import mongoose, { Model } from 'mongoose';
import { UserRewardHistoryType } from '../validators';

const userRewardHistorySchema = new mongoose.Schema<UserRewardHistoryType>(
  {
    userPhone: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
    },
    rewards: {
      type: Number,
    },
    currentBalance: Number,
    status: String,
    date: {
      type: Number,
      default: Date.now(),
    },
    businessName: {
      type: String,
    },
    waiterName: {
      type: String,
    },

    tableName: String,

    loyaltyId: {
      type: String,
    },
    total: {
      type: Number,
      default: 0,
    },
    subTotal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const UserRewardHistory: Model<UserRewardHistoryType> = mongoose.model<UserRewardHistoryType>('userRewardHistory', userRewardHistorySchema);

export { UserRewardHistory };
