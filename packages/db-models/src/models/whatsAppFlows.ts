import mongoose, { type Model } from "mongoose";
import type { WhatsAppFlowType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppFlowSchema = new mongoose.Schema<WhatsAppFlowType>(
  {
    name: { type: String, required: true },
    status: { type: Boolean, default: true },
    description: { type: String, required: false, default: "" },
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    flows: {
      type: [
        {
          templateName: { type: String, required: true },
          templateId: { type: String, required: true },
          triggerAt: { type: Number, default: 0 },
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const WhatsAppFlow: Model<WhatsAppFlowType> = mongoose.model<WhatsAppFlowType>(
  "whatsappflow",
  whatsAppFlowSchema,
);

export { WhatsAppFlow };
