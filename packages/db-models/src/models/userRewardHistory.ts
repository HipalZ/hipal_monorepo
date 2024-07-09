import mongoose, { type Model } from 'mongoose';
import type { UserRewardHistoryType } from '../validators';

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
