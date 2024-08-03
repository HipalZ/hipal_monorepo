import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { TagType } from "../validators";

const tagSchema = new mongoose.Schema(
  {
    tagTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "TagType",
    },
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
    remainderDate: {
      type: Number,
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
