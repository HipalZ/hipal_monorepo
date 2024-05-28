import mongoose from "mongoose";

interface KitchenAttrs {
  businessId: string;
  kitchenName: string;
  description: string;
  staff: string[];
};

interface KitchenModel extends mongoose.Model<KitchenDoc> {
  build(attrs: KitchenAttrs): KitchenDoc;
};

interface KitchenDoc extends mongoose.Document {
  businessId: string;
  kitchenName: string;
  description: string;
  staff: string[];
};

const kitchenSchema = new mongoose.Schema({
  businessId: {
    required: true,
    type: String,
  },
  kitchenName: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  staff: {
    required: false,
    type: [String],
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
});

kitchenSchema.statics.build = (attrs: KitchenAttrs) => {
  return new Kitchen(attrs);
};

const Kitchen = mongoose.model<KitchenDoc, KitchenModel, {}>('Kitchen', kitchenSchema);

export { Kitchen };
