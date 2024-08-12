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

  date: {
    type: Number,
  },
});

const GroupAnalytic: Model<groupAnalyticsType> =
  mongoose.model<groupAnalyticsType>("GroupAnalytic", groupAnalyticsSchema);

export { GroupAnalytic };
