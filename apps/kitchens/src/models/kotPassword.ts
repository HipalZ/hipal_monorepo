import mongoose from "mongoose";

interface KotPasswordAttrs {
  businessId: string;
  password: number;
}

interface KotPasswordModel extends mongoose.Model<KotPasswordDoc> {
  build(attrs: KotPasswordAttrs): KotPasswordDoc;
}

interface KotPasswordDoc extends mongoose.Document {
  businessId: string;
  password: number;
}

const kotPasswordSchema = new mongoose.Schema(
  {
    businessId: {
      required: true,
      type: String,
    },
    password: {
      type: Number,
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

kotPasswordSchema.statics.build = (attrs: KotPasswordAttrs) => {
  return new KotPassword(attrs);
};

const KotPassword = mongoose.model<KotPasswordDoc, KotPasswordModel, {}>(
  "kotpassword",
  kotPasswordSchema
);

export { KotPassword };
