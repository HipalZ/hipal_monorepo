import mongoose from "mongoose";

interface PaymentModeAttrs {
  businessId: string;
  mode?: string;
  commission: number;
}

interface PaymentModeModel extends mongoose.Model<PaymentModeDoc> {
  build(attrs: PaymentModeAttrs): PaymentModeDoc;
}

interface PaymentModeDoc extends mongoose.Document {
  businessId: string;
  mode?: string;
  commission: number;
}

const paymentModeSchema = new mongoose.Schema(
  {
    businessId: {
      required: false,
      type: String,
    },
    mode: String,
    commission: {
      type: Number,
      default: 0,
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

paymentModeSchema.statics.build = (attrs: PaymentModeAttrs) => {
  return new PaymentMode(attrs);
};

const PaymentMode = mongoose.model<PaymentModeDoc, PaymentModeModel, {}>(
  "PaymentMode",
  paymentModeSchema
);

export { PaymentMode };
