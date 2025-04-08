import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { ImagesType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const imagesSchema = new mongoose.Schema<ImagesType>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tagIds: {
      type: [ObjectId],
      ref: "Tag",
    },
    categoryBucketId: {
      type: ObjectId,
      ref: "categorybucket",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      required: true,
      unique: true,
    },
    businessId: {
      type: ObjectId,
      ref: "Business",
    },
  },
  { timestamps: true },
);

const Image: Model<ImagesType> = mongoose.model<ImagesType>(
  "image",
  imagesSchema,
);
export { Image };
