import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface Portion {
  name: string;
  price: number;
  discount: number;
  default: boolean;
  portionType: string;
  id: string;
}

interface Extra {
  name: string;
  numOptions: number;
  numSelections: number;
  compulsory: number;
  maxQuantity: number;
  addOnType: string;

  items: {
    name: string;
    price: number;
    description: string;
    visibility: boolean;
    maxQuantity: number;
    extraType: string;
    id: string;
  }[];
  id: string;
  businessId: string;
}

interface Filters {
  dishes: {
    name: string;
    id: string;
  }[];
  timeToConsume: string;
  portionBestSuited: string;
  bestWeather: string;
  levelOfSpice: string;
  bestOccasion: string;
  texture: string;
  time: string;
  metaTag: [string];
}

interface Category {
  name: string;
  id: string;
}

interface Tag {
  name: string;
  color: string;
  icon: string;
  fontColor: string;
}

interface DishAttrs {
  businessId: string;
  name: string;
  price: number;
  swiggy: number;
  visibility: boolean;

  discount: number;
  avgTime: number;
  dishType: string;
  categories: Category[];
  portions: Portion[];
  extras: Extra[];
  kitchenId: string;
  dineIn: Object;
  take_away: Object;
  delivery: any;
  filters: Filters;
  images: string[];
  description: string;
  tags: Tag[];
  links: string[];
  delayTime: number;
  availability: boolean;
  taxes: [Object];
}

interface DishModel extends mongoose.Model<DishDoc> {
  build(attrs: DishAttrs): DishDoc;
}

interface DishDoc extends mongoose.Document {
  businessId: string;
  name: string;
  price: number;
  swiggy: number;
  visibility: boolean;

  discount: number;
  avgTime: number;
  dishType: string;
  categories: Category[];
  portions: Portion[];
  extras: Extra[];
  kitchenId: string;
  filters: Filters;
  images: string[];
  description: string;
  tags: Tag[];
  links: string[];
  dineIn: Object;
  take_away: Object;
  delivery: any;
  version: number;
  delayTime: number;
  availability: boolean;
  taxes: [Object];
}

const dishSchema = new mongoose.Schema(
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
    portions: {
      type: [Object],
      required: false,
    },
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
        timeToConsume: "",
        portionBestSuited: "",
        bestWeather: "",
        levelOfSpice: "",
        bestOccasion: "",
        texture: "",
        time: "",
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
      default: "",
    },
    availability: {
      type: Boolean,
      required: false,
      default: true,
    },
    dineIn: {
      type: Object,
      default: {},
    },
    take_away: {
      type: Object,
      default: {},
    },
    delivery: {
      type: Object,
      default: {},
    },
    taxes: [Object],
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

dishSchema.set("versionKey", "version");
dishSchema.plugin(updateIfCurrentPlugin);

dishSchema.statics.build = (attrs: DishAttrs) => {
  return new Dish(attrs);
};

const Dish = mongoose.model<DishDoc, DishModel, {}>("Dish", dishSchema);

export { Dish };
