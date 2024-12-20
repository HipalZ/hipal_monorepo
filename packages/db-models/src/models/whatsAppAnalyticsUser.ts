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
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      templateId: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        required: true,
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
