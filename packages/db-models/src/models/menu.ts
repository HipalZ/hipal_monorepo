import mongoose from "mongoose";

interface MenuAttrs {
  businessId: string;
  name: string;
  dishes: [string];
}

interface MenuModel extends mongoose.Model<MenuDoc> {
  build(attrs: MenuAttrs): MenuDoc;
}

interface MenuDoc extends mongoose.Document {
  businessId: string;
  name: string;
  dishes: [string];
}

const menuSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    dishes: {
      type: [String],
      default: [],
    },
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

menuSchema.statics.build = (attrs: MenuAttrs) => {
  return new Menu(attrs);
};

const Menu = mongoose.model<MenuDoc, MenuModel, {}>("Menu", menuSchema);

export { Menu };
