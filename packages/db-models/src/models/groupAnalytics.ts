import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { groupAnalyticsType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const groupAnalyticsSchema = new mongoose.Schema<groupAnalyticsType>({
  groupId: {
    type: ObjectId,
    required: true,
    ref: "Group",
  },
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },

  userCount: {
    type: Number,
    required: false,
  },
  userPercentage: {
    type: Number,
    required: false,
  },
  duration: {
    type: Number,
    required: false,
    default: 30,
  },

  groupColor: {
    type: String,
    required: false,
  },
  groupName: {
    type: String,
    required: false,
  },
  spendAmount: {
    type: Number,
    required: false,
  },
  spendType: {
    type: String,
    required: false,
  },
  visitCount: {
    type: Number,
    required: false,
  },
  visitType: {
    type: String,
    required: false,
  },
  isDefault: {
    type: Boolean,
    required: false,
    default: false,
  },
  afternoon: {
    type: Boolean,
    required: false,
    default: false,
  },
  morning: {
    type: Boolean,
    required: false,
    default: false,
  },
  evening: {
    type: Boolean,
    required: false,
    default: false,
  },
  night: {
    type: Boolean,
    required: false,
    default: false,
  },

  date: {
    type: Number,
  },
});

const GroupAnalytic: Model<groupAnalyticsType> =
  mongoose.model<groupAnalyticsType>("GroupAnalytic", groupAnalyticsSchema);

export { GroupAnalytic };
