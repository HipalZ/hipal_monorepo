import mongoose, { type Model } from "mongoose";
import type { WhatsAppBlockedUserType } from "../validators";

const whatsAppBocledUserSchema = new mongoose.Schema<WhatsAppBlockedUserType>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const WhatsAppBlockedUser: Model<WhatsAppBlockedUserType> =
  mongoose.model<WhatsAppBlockedUserType>(
    "whatsappblockeduser",
    whatsAppBocledUserSchema,
  );

export { WhatsAppBlockedUser };
