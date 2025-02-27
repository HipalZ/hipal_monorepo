import mongoose, { type Model } from "mongoose";
import type { TaxTypes } from "../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;
const taxTypeschema = new mongoose.Schema<TaxTypes>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    value: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["PERCENTAGE", "FIXED"],
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
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

const Tax: Model<TaxTypes> = mongoose.model<TaxTypes>("tax", taxTypeschema);

export { Tax };
