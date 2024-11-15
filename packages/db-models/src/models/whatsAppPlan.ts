import mongoose, { type Model } from "mongoose";
import type { WhatsAppPlanType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppPlanChema = new mongoose.Schema<WhatsAppPlanType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    offering: {
      type: [String],
      required: true,
    },
    utilityTemplateCharge: {
      type: Number,
      default: 0.2,
    },
    marketingTemplateCharge: {
      type: Number,
      default: 0.89,
    },
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
  },
  {
    timestamps: true,
  },
);

const WhatsAppPlanModel: Model<WhatsAppPlanType> =
  mongoose.model<WhatsAppPlanType>("WhatsAppPlan", whatsAppPlanChema);

export { WhatsAppPlanModel };
