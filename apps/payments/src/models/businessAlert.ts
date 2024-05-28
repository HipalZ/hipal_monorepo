import mongoose from "mongoose";

interface BusinessAlertAttrs {
  businessId: string;
  subject: string;
  uniqueName: string;
  amount: number;
  lower: boolean;
  higher: boolean;
  date: string;
  value: number;
}

interface BusinessAlertModel extends mongoose.Model<BusinessAlertDoc> {
  build(attrs: BusinessAlertAttrs): BusinessAlertDoc;
}

interface BusinessAlertDoc extends mongoose.Document {
  businessId: string;
  subject: string;
  uniqueName: string;
  amount: number;
  lower: boolean;
  higher: boolean;
  date: string;
  value: number;
}

const businessAlertSchema = new mongoose.Schema(
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
    date: String,
    value: Number,
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

businessAlertSchema.statics.build = (attrs: BusinessAlertAttrs) => {
  return new BusinessAlert(attrs);
};

const BusinessAlert = mongoose.model<BusinessAlertDoc, BusinessAlertModel, {}>(
  "BusinessAlert",
  businessAlertSchema
);

export { BusinessAlert };
