import mongoose, { type Model } from "mongoose";
import type { UserRewardType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const userRewardSchema = new mongoose.Schema<UserRewardType>(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    loyaltyId: {
      type: ObjectId,
      required: true,
      ref: "LoyaltySetting",
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
    googleReviewCount: {
      type: Number,
      default: 0,
    },
    date: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const UserReward: Model<UserRewardType> = mongoose.model<UserRewardType>(
  "userReward",
  userRewardSchema,
);

export { UserReward };
