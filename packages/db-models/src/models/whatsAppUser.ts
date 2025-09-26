import mongoose, { type Model } from "mongoose";
import type { WhatsAppChatType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppChatSchema = new mongoose.Schema<WhatsAppChatType>({
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
  date: {
    type: Number,
    required: true,
    default: Date.now(),
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    required: true,
  },
  userId: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  ownerId: {
    type: ObjectId,
    required: false,
    ref: "User",
    default: null,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    expires: 60 * 60 * 24 * 30,
  },
});

const WhatsAppChat: Model<WhatsAppChatType> = mongoose.model<WhatsAppChatType>(
  "whatsappchat",
  whatsAppChatSchema,
);
export { WhatsAppChat };
