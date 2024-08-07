import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { TagType } from "../validators";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false, // Marked as optional
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    duration: {
      type: Number,
      required: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    noteTitle: {
      type: String,
      required: false,
    },
    noteDescription: {
      type: String,
      required: false,
    },
    noteUrl: {
      type: String,
      required: false,
    },
    displayForCaptains: {
      type: Boolean,
      required: false,
      default: true,
    },
    repeat: {
      type: Number,
      default: 0,
    },
    time: {
      type: Number,
      required: false,
    },

    remainderInDuration: {
      type: String,
      required: false,
    },

    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const TagModel: Model<TagType> = mongoose.model<TagType>("Tag", tagSchema);

export { TagModel };
