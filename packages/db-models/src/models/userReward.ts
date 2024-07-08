import mongoose, { Model } from 'mongoose';
import { UserRewardType } from '../validators';

const userRewardSchema = new mongoose.Schema<UserRewardType>(
  {
    userPhone: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
    },
    loyaltyId: {
      type: String,
      required: true,
    },

    rewards: {
      type: Number,
    },
    password: {
      type: Number,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    date: {
      type: Number,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const UserReward: Model<UserRewardType> = mongoose.model<UserRewardType>('userReward', userRewardSchema);

export { UserReward };
