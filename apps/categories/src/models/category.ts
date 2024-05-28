import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface Dish {
  name: string;
  id: string;
}

interface CategoryAttrs {
  businessId: string;
  name: string;
  visibility: boolean;
  timerOn: boolean;
  timerStart: String;
  timerEnd: String;
  availableDays: number[];
  hierarchy: string;
  parentCategory: string;
  parentCategoryId: string;
  coverImage: string;
  links: string[];
  dishes: Dish[];
  availability: boolean;
  charges: [];
}

interface CategoryModel extends mongoose.Model<CategoryDoc> {
  build(attrs: CategoryAttrs): CategoryDoc;
}

interface CategoryDoc extends mongoose.Document {
  businessId: string;
  name: string;
  visibility: boolean;
  timerOn: boolean;
  timerStart: String;
  timerEnd: String;
  availableDays: number[];
  hierarchy: string;
  parentCategory: string;
  parentCategoryId: string;
  coverImage: string;
  links: string[];
  dishes: Dish[];
  version: number;
  availability: boolean;
  charges: [];
}

const categorySchema = new mongoose.Schema(
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
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

categorySchema.set("versionKey", "version");
categorySchema.plugin(updateIfCurrentPlugin);

categorySchema.statics.build = (attrs: CategoryAttrs) => {
  return new Category(attrs);
};

const Category = mongoose.model<CategoryDoc, CategoryModel, {}>(
  "Category",
  categorySchema
);

export { Category };
