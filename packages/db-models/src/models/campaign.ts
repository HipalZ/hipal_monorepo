import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { CampaignType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const campaignSchema = new mongoose.Schema<CampaignType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    campaignName: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
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

const Campaign: Model<CampaignType> = mongoose.model<CampaignType>(
  "campaign",
  campaignSchema,
);

export { Campaign };
