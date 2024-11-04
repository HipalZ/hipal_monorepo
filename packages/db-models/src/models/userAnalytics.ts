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
});

const UserAnalytic: Model<UserAnalytics> = mongoose.model<UserAnalytics>(
  "UserAnalytic",
  userAnalyticsSchema,
);

export { UserAnalytic };
