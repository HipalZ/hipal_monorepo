import mongoose from "mongoose";

interface PaymentAlertAttrs {
  businessId: string;
  subject: string;
  uniqueName: string;
  amount: number;
  lower: boolean;
  higher: boolean;
  isActive: boolean;
}

interface PaymentAlertModel extends mongoose.Model<PaymentAlertDoc> {
  build(attrs: PaymentAlertAttrs): PaymentAlertDoc;
}

interface PaymentAlertDoc extends mongoose.Document {
  businessId: string;
  subject: string;
  uniqueName: string;
  amount: number;
  lower: boolean;
  higher: boolean;
  isActive: boolean;
}

const paymentAlertSchema = new mongoose.Schema(
  {
    businessId: {
      required: false,
      type: String,
    },
    subject: String,
    uniqueName: String,
    amount: Number,
    lower: {
      type: Boolean,
      default: false,
    },
    higher: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
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

paymentAlertSchema.statics.build = (attrs: PaymentAlertAttrs) => {
  return new PaymentAlert(attrs);
};

const PaymentAlert = mongoose.model<PaymentAlertDoc, PaymentAlertModel, {}>(
  "PaymentAlert",
  paymentAlertSchema
);

export { PaymentAlert };
