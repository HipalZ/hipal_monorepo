import mongoose from "mongoose";

interface UserRewardHistoryAttrs {
  userPhone: string;
  day: string;
  userName: string;
  businessName: string;
  waiterName: string;
  rewards: number;
  status: string;
  date: string;
  time: string;
  items: [];
  total: number;
  subTotal: number;
  sgst: number;
  cgst: number;
  currentBalance: number;
  tableName: string;
  loyaltyId: string;
  reward_date: number;
}

interface UserRewardHistoryModel extends mongoose.Model<UserRewardHistoryDoc> {
  build(attrs: UserRewardHistoryAttrs): UserRewardHistoryDoc;
}

interface UserRewardHistoryDoc extends mongoose.Document {
  userPhone: string;
  userName: string;
  rewards: number;
  status: string;
  businessName: string;
  date: string;
  time: string;
  waiterName: string;
  currentBalance: number;
  items: [];
  total: number;
  subTotal: number;
  sgst: number;
  cgst: number;
  tableName: string;
  day: string;
  loyaltyId: string;
  reward_date: number;
}

const userRewardHistorySchema = new mongoose.Schema(
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
      default: Date.now,
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

userRewardHistorySchema.statics.build = (attrs: UserRewardHistoryAttrs) => {
  return new UserRewardHistory(attrs);
};

const UserRewardHistory = mongoose.model<
  UserRewardHistoryDoc,
  UserRewardHistoryModel,
  {}
>("userRewardHistory", userRewardHistorySchema);

export { UserRewardHistory };
