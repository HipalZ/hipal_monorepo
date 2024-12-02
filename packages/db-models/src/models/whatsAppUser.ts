import mongoose, { type Model } from "mongoose";
import type { WhatsappUserType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppUserSchema = new mongoose.Schema<WhatsappUserType>({
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
    required: true,
    ref: "User",
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

const WhatsAppUser: Model<WhatsappUserType> = mongoose.model<WhatsappUserType>(
  "whatsappuser",
  whatsAppUserSchema,
);
export { WhatsAppUser };
