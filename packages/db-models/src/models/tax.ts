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
    menuId: {
      type: ObjectId,
      required: false,
      ref: "menu",
    },
    baseMenuTaxId: {
      type: ObjectId,
      required: false,
      ref: "tax",
      default: null,
    },
    baseMenuId: {
      type: ObjectId,
      required: false,
      ref: "menu",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const taxNames = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create a model for the tax schema
const TaxName = mongoose.model("taxname", taxNames);
// Create a model for the tax schema

const Tax: Model<TaxTypes> = mongoose.model<TaxTypes>("tax", taxTypeschema);

export { Tax, TaxName };
