import mongoose, { type Model } from "mongoose";
import type { WhatsappWABAType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppWABA = new mongoose.Schema<WhatsappWABAType>({
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
  displayName: {
    type: String,
    required: true,
  },
  displayNumber: {
    type: String,
    required: true,
  },
  facebookId: {
    type: String,
    required: false,
  },
  facebookPassword: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  status: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Number,
    default: Date.now(),
  },
});

const WhatsAppWABA: Model<WhatsappWABAType> = mongoose.model<WhatsappWABAType>(
  "whatsappwaba",
  whatsAppWABA,
);
export { WhatsAppWABA };
