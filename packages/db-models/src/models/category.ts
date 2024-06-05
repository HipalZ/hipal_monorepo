import mongoose, { Model } from "mongoose";
import { CategoryType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId as any;
const categorySchema = new mongoose.Schema<CategoryType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    visibility: {
      type: Boolean,
      required: true,
    },
    timerOn: {
      type: Boolean,
      required: false,
    },
    timerStart: {
      type: String,
      required: false,
    },
    timerEnd: {
      type: String,
      required: false,
    },
    availableDays: {
      type: [Number],
      required: false,
    },
    hierarchy: {
      type: String,
      enum: ["PARENT", "CHILD"],
      required: true,
    },
    parentCategory: {
      type: String,
      default: "",
      required: false,
    },
    parentCategoryId: {
      type: String,
      default: "",
      ref: "category",
      required: false,
    },
    coverImage: {
      type: String,
      required: false,
    },
    links: {
      type: [String],
      required: true,
    },
    dishes: {
      type: [ObjectId],
      required: true,
      ref: "Dish",
    },
    availability: {
      type: Boolean,
      required: false,
      default: true,
    },
    charges: [Object],
  },
  {
    timestamps: true,
  }
);

const Category: Model<CategoryType> = mongoose.model<CategoryType>(
  "category",
  categorySchema
);

export { Category };
