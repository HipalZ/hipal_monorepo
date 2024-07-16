import mongoose, { type Model } from 'mongoose';
import type { UserRewardHistoryType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;


const userRewardHistorySchema = new mongoose.Schema<UserRewardHistoryType>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    rewards: {
      type: Number,
    },

    status: {
      type: String,
      enum: ['MINUS', 'PLUS'],
    },
    date: {
      type: Number,
    },

    tableName: {
      type: String,
    },
    order_id: {
      type: ObjectId,
      ref: 'Order',

    },


    loyaltyId: {
      type: ObjectId,
      required: true,
      ref: 'LoyaltySetting',
    },
  },
  {
    timestamps: true,
  },
);

const UserRewardHistory: Model<UserRewardHistoryType> = mongoose.model<UserRewardHistoryType>('userRewardHistory', userRewardHistorySchema);

export { UserRewardHistory };
