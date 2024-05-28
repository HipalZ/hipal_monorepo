import mongoose from "mongoose";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface CategoryAttrs {
  id: string;
  name: string;
  businessId: string;
};

interface CategoryModel extends mongoose.Model<CategoryDoc> {
  build(attrs: CategoryAttrs): CategoryDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<CategoryDoc | null>;
};

interface CategoryDoc extends mongoose.Document {
  name: string;
  businessId: string;
  version: number;
};

const categorySchema = new mongoose.Schema({
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

categorySchema.set('versionKey', 'version');
categorySchema.plugin(updateIfCurrentPlugin);

categorySchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Category.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

categorySchema.statics.build = (attrs: CategoryAttrs) => {
  return new Category({
    _id: attrs.id,
    name: attrs.name,
    businessId: attrs.businessId,
  });
};

const Category = mongoose.model<CategoryDoc, CategoryModel, {}>('Category', categorySchema);

export { Category };
