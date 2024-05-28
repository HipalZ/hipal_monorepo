import mongoose ,{Model} from "mongoose";
import { CategoryType } from "../validators";

const categorySchema = new mongoose.Schema<CategoryType>(
  {
    businessId: {
      type: String,
      required: true,
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
      required: true,
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
      required: true,
    },
    hierarchy: {
      type: String,
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
      type: [Object],
      required: true,
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
