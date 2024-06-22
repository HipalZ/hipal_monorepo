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
    date: String,
    time: String,
    businessName: {
      type: String,
    },
    waiterName: {
      type: String,
    },
    items: {
      type: [],
      default: [],
    },
    tableName: String,
    day: {
      type: String,
    },
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
    sgst: {
      type: Number,
      default: 0,
    },
    cgst: {
      type: Number,
      default: 0,
    },
    reward_date: {
      type: Number,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  },
);

const UserRewardHistory: Model<UserRewardHistoryType> = mongoose.model<UserRewardHistoryType>('userRewardHistory', userRewardHistorySchema);

export { UserRewardHistory };
