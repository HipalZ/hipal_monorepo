import mongoose from "mongoose";

interface UserRewardAttrs {
  userPhone: string;
  userName: string;
  loyaltyId: string;
  rewards: number;
  password: number;
  scanCount: number;
  date: number;
  count: number;
}

interface UserRewardModel extends mongoose.Model<UserRewardDoc> {
  build(attrs: UserRewardAttrs): UserRewardDoc;
}

interface UserRewardDoc extends mongoose.Document {
  userPhone: string;
  userName: string;
  loyaltyId: string;
  rewards: number;
  password: number;
  scanCount: number;
  date: number;
  count: number;
}

const userRewardSchema = new mongoose.Schema(
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
      default: Date.now(),
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

userRewardSchema.statics.build = (attrs: UserRewardAttrs) => {
  return new UserReward(attrs);
};

const UserReward = mongoose.model<UserRewardDoc, UserRewardModel, {}>(
  "userReward",
  userRewardSchema
);

export { UserReward };
