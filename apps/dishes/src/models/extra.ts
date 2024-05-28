import mongoose from "mongoose";

interface Items {
  name: string;
  price: number;
  description: string;
  visibility: boolean;
  maxQuantity: number;
  extraType: string;
  id: string;
}
interface ExtraAttrs {
  businessId: string;
  name: string;
  numOptions: number;
  numSelections: number;
  compulsory: number;
  maxQuantity: number;
  addOnType: string;

  items: Items[];
}

interface ExtraModel extends mongoose.Model<ExtraDoc> {
  build(attrs: ExtraAttrs): ExtraDoc;
}

interface ExtraDoc extends mongoose.Document {
  businessId: string;
  name: string;
  numOptions: number;
  numSelections: number;
  compulsory: number;
  maxQuantity: number;
  addOnType: string;

  items: Items[];
}

const extraSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    numOptions: {
      type: Number,
    },
    numSelections: {
      type: Number,
    },
    compulsory: {
      type: Number,
    },
    maxQuantity: {
      type: Number,
    },
    addOnType: {
      type: String,
    },

    items: [Object],
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

extraSchema.statics.build = (attrs: ExtraAttrs) => {
  return new Extra(attrs);
};

const Extra = mongoose.model<ExtraDoc, ExtraModel, {}>("Extra", extraSchema);

export { Extra };
