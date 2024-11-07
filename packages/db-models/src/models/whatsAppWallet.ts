import mongoose, { type Model } from "mongoose";
import type { WhatsAppWalletType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppWalletSchema = new mongoose.Schema<WhatsAppWalletType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
    },
    currentBalance: {
      type: Number,
      required: true,
    },
    date: {
      type: Number,
      required: true,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  },
);

const WhatsAppWallet: Model<WhatsAppWalletType> =
  mongoose.model<WhatsAppWalletType>("whatsAppWallet", whatsAppWalletSchema);

export { WhatsAppWallet };
