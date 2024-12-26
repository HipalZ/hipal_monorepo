import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { RecentCampaignType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const recentCampaignSchema = new mongoose.Schema<RecentCampaignType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },

    campaignId: {
      type: String,
      required: true,
    },

    templateId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const RecentCampaign: Model<RecentCampaignType> =
  mongoose.model<RecentCampaignType>("recentcampaign", recentCampaignSchema);

export { RecentCampaign };
