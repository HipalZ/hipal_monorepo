import mongoose, { type Model } from "mongoose";
import type { WhatsAppLimitType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppTemplateLimitSchema = new mongoose.Schema<WhatsAppLimitType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
    },
    templateLimit: {
      type: Number,
      required: true,
      default: 10,
    },
    date: {
      type: Number,
      required: true,
      default: Date.now(),
    },
    tier: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

const WhatsAppTemplateLimit: Model<WhatsAppLimitType> =
  mongoose.model<WhatsAppLimitType>(
    "whatsAppTemplateLimit",
    whatsAppTemplateLimitSchema,
  );

export { WhatsAppTemplateLimit };
