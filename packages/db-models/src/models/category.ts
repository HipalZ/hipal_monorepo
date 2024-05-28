import mongoose, { Model } from "mongoose";
import { CategoryType } from "../validators";

const categoryDbSchema = new mongoose.Schema<CategoryType>(
  {
    businessId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category: Model<CategoryType> = mongoose.model<CategoryType>(
  "category",
  categoryDbSchema
);

export { Category };
