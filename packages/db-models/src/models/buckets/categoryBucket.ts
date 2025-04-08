import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { CategoryBucketType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const categoryBucketSchema = new mongoose.Schema<CategoryBucketType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    businessId: {
      type: ObjectId,
      ref: "Business",
    },
  },
  { timestamps: true },
);

const CategoryBucket: Model<CategoryBucketType> =
  mongoose.model<CategoryBucketType>("categorybucket", categoryBucketSchema);
export { CategoryBucket };
