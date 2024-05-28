import mongoose from "mongoose";

interface ChargesAttrs {
  businessId: string;
  chargeName: string;
  chargeType: string;
  value: number;
  typeOfValue: string;
}

interface ChargesModel extends mongoose.Model<ChargesDoc> {
  build(attrs: ChargesAttrs): ChargesDoc;
}

interface ChargesDoc extends mongoose.Document {
  businessId: string;
  chargeName: string;
  chargeType: string;
  value: number;
  typeOfValue: string;
}

const chargesSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    chargeName: {
      type: String,
    },
    chargeType: {
      type: String,
    },
    value: {
      type: Number,
    },
    typeOfValue: {
      type: String,
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

chargesSchema.statics.build = (attrs: ChargesAttrs) => {
  return new Charges(attrs);
};

const Charges = mongoose.model<ChargesDoc, ChargesModel, {}>(
  "Charges",
  chargesSchema
);

export { Charges };
