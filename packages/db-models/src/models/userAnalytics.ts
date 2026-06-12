import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { UserAnalytics } from "../validators/userAnalytics";
const ObjectId = mongoose.Schema.Types.ObjectId;

const userAnalyticsSchema = new mongoose.Schema<UserAnalytics>({
  userId: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
  visitCount: {
    type: Number,
    required: true,
  },
  totalSpend: {
    type: Number,
    required: true,
  },
  avgSpend: {
    type: Number,
    required: true,
  },
  coinzIssued: {
    type: Number,
    required: false,
  },
  coinzUsed: {
    type: Number,
    required: false,
  },
  dateOfJoining: {
    type: Number,
    required: false,
  },
  tableName: {
    type: String,
    required: false,
  },
  couponCount: {
    type: Number,
    required: false,
  },
  currentCoins: {
    type: Number,
    required: false,
  },
  tagIds: {
    type: [ObjectId],
    required: false,
    ref: "Tag",
  },
  dob: {
    type: Number,
    required: false,
  },
});

userAnalyticsSchema.index({ businessId: 1, dateOfJoining: -1, _id: -1 });
userAnalyticsSchema.index({ businessId: 1, visitCount: -1 });

const UserAnalytic: Model<UserAnalytics> = mongoose.model<UserAnalytics>(
  "UserAnalytic",
  userAnalyticsSchema,
);

export { UserAnalytic };
