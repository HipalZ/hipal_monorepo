import mongoose, { type Model } from "mongoose";
import type { WhatsAppTemplateAnalyticsType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppTemplateAnalyticsSchema =
  new mongoose.Schema<WhatsAppTemplateAnalyticsType>(
    {
      businessId: {
        type: ObjectId,
        required: true,
      },
    },
    {
      timestamps: true,
    },
  );

const WhatsTemplateAnalytics: Model<WhatsAppTemplateAnalyticsType> =
  mongoose.model<WhatsAppTemplateAnalyticsType>(
    "whatsAppTemplateAnalytic",
    whatsAppTemplateAnalyticsSchema,
  );

export { WhatsTemplateAnalytics };
