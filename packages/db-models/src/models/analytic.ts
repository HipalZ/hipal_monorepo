import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { AnalyticsType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const analyticSchema = new mongoose.Schema<AnalyticsType>({
  businessId: {
    type: ObjectId,
    required: true,
  },
  userId: {
    type: ObjectId,
    required: true,
  },
  totalUserSpend: {
    type: Number,
    default: 0,
    required: true,
  },
  avgUserSpend: {
    type: Number,
    default: 0,
    required: true,
  },
  userCount: {
    type: Number,
    default: 0,
    required: true,
  },
  totalUserRatingSum: {
    type: Number,
    default: 0,
    required: false,
  },
  avgUserRating: {
    type: Number,
    default: 0,
    required: false,
  },
  userReviewCount: {
    type: Number,
    default: 0,
    required: false,
  },
  totalUserSpendForBusiness: {
    type: Number,
    required: true,
  },
  avgUserSpendForBusiness: {
    type: Number,
    required: true,
  },
  businessUserCount: {
    type: Number,
    required: true,
  },
  totalBusinessRatingSum: {
    type: Number,
    default: 0,
    required: false,
  },
  avgBusinessRating: {
    type: Number,
    default: 0,
    required: false,
  },
  businessReviewCount: {
    type: Number,
    default: 0,
    required: false,
  },
  date: {
    type: Number,
    required: true,
  },
  dateOfJoiningOfUserForBusiness: {
    type: Number,
    required: true,
  },
});

const Analytic: Model<AnalyticsType> = mongoose.model<AnalyticsType>(
  "analytic",
  analyticSchema,
);
export { Analytic };
