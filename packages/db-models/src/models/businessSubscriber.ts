import mongoose, { type Model } from "mongoose";
import type { BusinessSubscriber } from "../validators";
const businessSubscriberSchema = new mongoose.Schema<BusinessSubscriber>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Business",
    },
    userCount: {
      type: Number,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    whatsappMsgUnseenCount: {
      type: Number,
      default: 0,
    },
    date: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Subscriber: Model<BusinessSubscriber> =
  mongoose.model<BusinessSubscriber>("subscriber", businessSubscriberSchema);

export { Subscriber };
