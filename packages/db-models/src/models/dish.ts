import mongoose, { Model } from "mongoose";
import { DishType } from "../validators";

const dishSchema = new mongoose.Schema<DishType>(
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
    price: {
      type: Number,
      required: true,
    },
    swiggy: {
      type: Number,
      required: false,
    },
    visibility: {
      type: Boolean,
      required: false,
      default: true,
    },
    discount: {
      type: Number,
      required: false,
    },
    avgTime: {
      type: Number,
      required: false,
    },
    dishType: {
      type: String,
      required: true,
    },
    categories: {
      type: [Object],
      required: false,
    },
    portions: [{}],
    extras: {
      type: [Object],
      required: false,
      default: [],
    },
    kitchenId: {
      type: String,
      required: true,
    },
    filters: {
      type: Object,
      required: false,
      default: {
        timeToConsume: 0,
        portionBestSuited: "",
        bestWeather: "",
        levelOfSpice: "",
        bestOccasion: "",
        texture: "",
        time: 0,
        dishes: [],
      },
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
      type: [Object],
      required: false,
    },
    links: {
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
  },
  {
    timestamps: true,
  }
);

// dishSchema.set("versionKey", "version");

const Dish: Model<DishType> = mongoose.model<DishType>("dish", dishSchema);

export { Dish };
