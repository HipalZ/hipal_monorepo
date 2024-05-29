import mongoose from "mongoose";

interface DuesAttrs {
  businessId: string;
  duesPersonNames?: string;
}

interface DuesModel extends mongoose.Model<DuesDoc> {
  build(attrs: DuesAttrs): DuesDoc;
}

interface DuesDoc extends mongoose.Document {
  businessId: string;
  duesPersonNames?: string;
}

const duesSchema = new mongoose.Schema(
  {
    businessId: {
      required: false,
      type: String,
    },
    duesPersonNames: String,
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

duesSchema.statics.build = (attrs: DuesAttrs) => {
  return new Dues(attrs);
};

const Dues = mongoose.model<DuesDoc, DuesModel, {}>("Dues", duesSchema);

export { Dues };
