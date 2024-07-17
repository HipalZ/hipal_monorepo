import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { DishType, PortionType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

import { DishTypeEnum } from "../validators/dish";

const portionSchema = new mongoose.Schema<PortionType>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    default: {
      type: Boolean,
      required: false,
    },
    portionTypes: {
      type: [String],
      enum: DishTypeEnum,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const dishSchema = new mongoose.Schema<DishType>(
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
    price: {
      type: Number,
      required: true,
    },

    visibility: {
      type: Boolean,
      required: false,
      default: true,
    },

    avgTime: {
      type: Number,
      required: false,
    },
    dishTypes: {
      type: [String],
      enum: DishTypeEnum,
      required: true,
    },
    categoryIds: {
      type: [ObjectId],
      required: false,
    },
    portions: {
      type: [portionSchema],
      required: false,
    },

    addOns: {
      type: [ObjectId],
      required: false,
      default: [],
      ref: "Extra",
    },
    kitchenId: {
      type: ObjectId,
      required: false,
      ref: "Kitchen",
    },

    images: {
      type: [String],
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    tags: {
      type: [String],
      required: false,
    },

    delayTime: {
      type: Number,
      required: false,
    },
    availability: {
      type: Boolean,
      required: false,
      default: true,
    },
    calories: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    recommendations: {
      type: [ObjectId],
      required: false,
      ref: "Dish",
    },
  },
  {
    timestamps: true,
  },
);

const Dish: Model<DishType> = mongoose.model<DishType>("Dish", dishSchema);

export { Dish };
