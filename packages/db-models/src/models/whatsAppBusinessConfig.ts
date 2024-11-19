import mongoose, { type Model } from "mongoose";
import type { WhatsAppBusinessConfigType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppBusinessConfigSchema =
  new mongoose.Schema<WhatsAppBusinessConfigType>(
    {
      businessId: {
        type: ObjectId,
        required: true,
        ref: "Business",
        unique: true,
      },
      token: {
        type: String,
        required: true,
      },
      phoneId: {
        type: String,
        required: true,
      },
      whatsAppAccountId: {
        type: String,
        required: true,
      },
      version: {
        type: String,
        required: true,
      },
      templateLimit: {
        type: Number,
        required: true,
      },
      planId: {
        type: ObjectId,
        required: false,
        ref: "Plan",
      },
      whatsAppPhone: {
        type: String,
        required: true,
      },
      menuRedirection: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    },
  );

const WhatsAppBusinessConfig: Model<WhatsAppBusinessConfigType> =
  mongoose.model<WhatsAppBusinessConfigType>(
    "WhatsAppBusinessConfig",
    whatsAppBusinessConfigSchema,
  );

export { WhatsAppBusinessConfig };
