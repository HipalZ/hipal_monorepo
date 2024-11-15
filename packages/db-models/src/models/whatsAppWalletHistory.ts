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
        ref: "User",
      },

      date: {
        type: Number,
        required: true,
        default: Date.now(),
      },

      status: {
        type: String,
        enum: ["SUCCESS", "FAILED"],
        required: true,
      },

      order_id: {
        type: ObjectId,
        required: true,
        ref: "whatsAppOrder",
        unique: true,
      },
      errorReason: {
        type: String,
        required: false,
      },
      errorDescription: {
        type: String,
        required: false,
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
