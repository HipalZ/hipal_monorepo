import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { WhatsAppAnalyticsUserType } from "../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppAnalyticsUserSchema =
  new mongoose.Schema<WhatsAppAnalyticsUserType>(
    {
      businessId: {
        type: ObjectId,
        required: true,
        ref: "Business",
      },
      userId: {
        type: ObjectId,
        required: false,
        ref: "User",
        default: null,
      },

      templateId: {
        type: String,
        required: false,
      },
      status: {
        type: String,
        required: true,
      },
      date: {
        type: Number,
        required: true,
      },
      campaignId: {
        type: ObjectId,
        required: false,
      },
      messageId: {
        type: String,
        required: true,
      },
      error: {
        type: [],
        required: false,
        default: [],
      },
    },
    {
      timestamps: true,
    },
  );

const WhatsAppAnalyticsUser: Model<WhatsAppAnalyticsUserType> =
  mongoose.model<WhatsAppAnalyticsUserType>(
    "whatsAppAnalyticsUser",
    whatsAppAnalyticsUserSchema,
  );

export { WhatsAppAnalyticsUser };
