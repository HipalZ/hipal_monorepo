import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { DishType, PortionType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

import { DishTypeEnum } from "../validators/dish";
import { timingSchema } from "./category";
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
    posPortionId: {
      type: String,
      required: false,
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

    addOnIds: {
      type: [ObjectId],
      required: false,
      default: [],
      ref: "addon",
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
    recommendationIds: {
      type: [ObjectId],
      required: false,
      default: [],
      ref: "Dish",
    },
    menuId: {
      type: ObjectId,
      required: false,
      ref: "menu",
    },
    ignoreDiscount: {
      type: String,
      required: false,
    },
    ignoreTax: {
      type: String,
      required: false,
    },
    pos: {
      type: Boolean,
      required: false,
      default: false,
    },
    posDishId: {
      type: String,
      required: false,
    },

    posTax: {
      type: String,
      required: false,
    },
    rank: {
      type: Number,
      required: false,
    },
    active: {
      type: Boolean,
      required: false,
      default: true,
    },
    gst: {
      type: Number,
      required: false,
      default: 5,
    },
    vat: {
      type: Number,
      required: false,
      default: 0,
    },
    avgPrepTime: {
      type: Number,
      required: false,
      default: 0,
    },
    timings: {
      type: [timingSchema],
      required: false,
    },
    discount: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Dish: Model<DishType> = mongoose.model<DishType>("Dish", dishSchema);

export { Dish };
