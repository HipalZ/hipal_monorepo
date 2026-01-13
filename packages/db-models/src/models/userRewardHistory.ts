import mongoose, { type Model } from "mongoose";
import type { UserRewardHistoryType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const userRewardHistorySchema = new mongoose.Schema<UserRewardHistoryType>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      default: null,
    },
    rewards: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["MINUS", "PLUS"],
    },
    date: {
      type: Number,
    },

    tableName: {
      type: String,
    },
    order_id: {
      type: ObjectId,
      ref: "Order",
      default: null,
    },

    loyaltyId: {
      type: ObjectId,
      required: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const UserRewardHistory: Model<UserRewardHistoryType> =
  mongoose.model<UserRewardHistoryType>(
    "userRewardHistory",
    userRewardHistorySchema,
  );

export { UserRewardHistory };
