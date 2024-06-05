import mongoose, { Model } from "mongoose";
import { DishType, PortionType, FiltersType, TagType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId as any;
import { ClientSession } from "mongoose";

const tagsSchema = new mongoose.Schema<TagType>(
  {
    name: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      required: false,
    },
    icon: {
      type: String,
      required: false,
    },
    fontColor: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

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
    discount: {
      type: Number,
      required: false,
    },
    default: {
      type: Boolean,
      required: true,
    },
    portionType: {
      type: String,
      required: false,
    },
    id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const filtersSchema = new mongoose.Schema<FiltersType>(
  {
    dishes: {
      type: [ObjectId],
      required: false,
      ref: "Dish",
    },
    timeToConsume: {
      type: Number,
      required: false,
    },
    portionBestSuited: {
      type: String,
      required: false,
    },
    bestWeather: {
      type: String,
      required: false,
    },
    levelOfSpice: {
      type: String,
      required: false,
    },
    bestOccasion: {
      type: String,
      required: false,
    },
    texture: {
      type: String,
      required: false,
    },
    time: {
      type: Number,
      required: false,
    },
    metaTags: {
      type: [String],
      required: false,
    },
  },
  {
    timestamps: true,
  }
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
      type: [ObjectId],
      required: false,
      ref: "category",
    },
    portions: [
      {
        type: [portionSchema],
        required: false,
      },
    ],
    extras: {
      type: [ObjectId],
      required: false,
      default: [],
      ref: "Extra",
    },
    kitchenId: {
      type: ObjectId,
      required: true,
      ref: "Kitchen",
    },
    filters: {
      type: filtersSchema,
      required: false,
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
      type: [tagsSchema],
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

const Dish: Model<DishType> = mongoose.model<DishType>("Dish", dishSchema);

export { Dish };
