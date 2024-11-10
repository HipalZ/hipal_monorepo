import mongoose, { type Model } from "mongoose";
import type { WhatsAppWalletHistoryType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppWalletHistorySchema =
  new mongoose.Schema<WhatsAppWalletHistoryType>(
    {
      businessId: {
        type: ObjectId,
        required: true,
      },
      userId: {
        type: ObjectId,
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        default: 0,
      },
      discount: {
        type: Number,
        required: false,
        default: 0,
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

const WhatsAppWalletHistory: Model<WhatsAppWalletHistoryType> =
  mongoose.model<WhatsAppWalletHistoryType>(
    "whatsAppWalletHistory",
    whatsAppWalletHistorySchema,
  );

export { WhatsAppWalletHistory };
