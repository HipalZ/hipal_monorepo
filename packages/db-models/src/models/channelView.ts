import mongoose, { type Model } from "mongoose";
import type { ChannelViewType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const channelViewSchema = new mongoose.Schema<ChannelViewType>(
  {
    channelId: {
      type: ObjectId,
      required: true,
      ref: "couponChannel",
      index: true,
    },

    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },

    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const ChannelView: Model<ChannelViewType> = mongoose.model<ChannelViewType>(
  "ChannelView",
  channelViewSchema,
);

export { ChannelView };
