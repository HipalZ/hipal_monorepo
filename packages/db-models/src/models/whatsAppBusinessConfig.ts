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
        unique: true,
      },
      whatsAppAccountId: {
        type: String,
        required: true,
      },
      appId: {
        type: String,
        required: true,
      },
      configId: {
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
        unique: true,
      },
      menuRedirection: {
        type: String,
        required: true,
      },
      ownerId: {
        type: ObjectId,

        required: false,
        ref: "User",
      },
      marketingTemplateCost: {
        type: Number,
        required: false,
        default: 0.89,
      },
      utilityTemplateCost: {
        type: Number,
        required: false,
        default: 0.2,
      },
      sendBillSummaryTemplate: {
        type: Boolean,
        required: false,
        default: false,
      },
      businessName: {
        type: String,
        required: true,
      },
      couponShortUrl: {
        type: String,
        required: true,
        unique: true,
      },
      couponDiscount: {
        type: Number,
        required: true,
      },
      direction: {
        type: String,
        required: true,
      },
      socialLink: {
        type: String,
        required: true,
      },
      campaign: {
        type: Boolean,
        required: false,
        default: false,
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
