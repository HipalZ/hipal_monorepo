import mongoose from "mongoose";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface DishAttrs {
  id: string;
  name: string;
  businessId: string;
};

interface DishModel extends mongoose.Model<DishDoc> {
  build(attrs: DishAttrs): DishDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<DishDoc | null>;
};

interface DishDoc extends mongoose.Document {
  name: string;
  businessId: string;
  version: number;
};

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  businessId: {
    type: String,
    required: true,
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

dishSchema.set('versionKey', 'version');
dishSchema.plugin(updateIfCurrentPlugin);

dishSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Dish.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

dishSchema.statics.build = (attrs: DishAttrs) => {
  return new Dish({
    _id: attrs.id,
    name: attrs.name,
    businessId: attrs.businessId,
 
  });
};

const Dish = mongoose.model<DishDoc, DishModel, {}>('Dish', dishSchema);

export { Dish };
