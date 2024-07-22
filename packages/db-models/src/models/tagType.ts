import mongoose, { type Model } from "mongoose";
import type { TagTypes } from "../validators";
const tagTypeSchema = new mongoose.Schema<TagTypes>(
  {
    tagType: {
      type: String,
      required: true,
    },
    description: {
      type: String,

      required: false, // Marked as optional
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

const TagTypeModel: Model<TagTypes> = mongoose.model<TagTypes>(
  "TagType",
  tagTypeSchema,
);

export { TagTypeModel };
