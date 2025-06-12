import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { CategoryType } from "../validators";
import { HierarchyEnum } from "../validators/category";
const ObjectId = mongoose.Schema.Types.ObjectId;
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

    hierarchy: {
      type: String,
      enum: HierarchyEnum,
      required: true,
    },

    parentCategoryIds: {
      type: [ObjectId],
      default: [],
      required: false,
      ref: "category",
    },
    coverImage: {
      type: String,
      required: false,
    },
    subCategoryIds: {
      type: [ObjectId],
      required: false,
      default: [],
      ref: "category",
    },

    dishIds: {
      type: [ObjectId],
      required: false,
      default: [],
      ref: "Dish",
    },
    availability: {
      type: Boolean,
      required: false,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    sequence: {
      type: Number,
      required: false,
      default: 0,
    },
    menuId: {
      type: ObjectId,
      required: false,
      ref: "menu",
    },
    categoryTimings: {
      type: String,
      required: false,
    },
    posCategoryId: {
      type: String,
      required: false,
    },
    rank: {
      type: Number,
      required: false,
    },
    pos: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Category: Model<CategoryType> = mongoose.model<CategoryType>(
  "category",
  categorySchema,
);

export { Category };
