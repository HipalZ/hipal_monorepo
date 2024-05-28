import mongoose from "mongoose";

interface TempModel {
  hiCode: string;
  tableId: string;
  discountAmount: number;
  claimedAmount: number;
  tipsAmount: number;
  serviceChargeApply: boolean;
  mode: string;
  duesPersonId: string;
  customerName: string;
  customerPhone: string;
  discountDescription: string;
  discountPercentage: number;
  discountMode: string;
  serviceChargeRemovedBy: string;
  serviceChargeAddedBy: string;
  coinsGivenBy: string;
  discountGivenBy: string;
  discountRemovedBy: string;
  tipsGivenBy: string;
}

interface TempModelModel extends mongoose.Model<TempModelDoc> {
  build(attrs: TempModel): TempModelDoc;
}

interface TempModelDoc extends mongoose.Document {
  hiCode: string;
  tableId: string;
  discountAmount: number;
  claimedAmount: number;
  tipsAmount: number;
  serviceChargeApply: boolean;
  mode: string;
  duesPersonId: string;
  customerName: string;
  customerPhone: string;
  discountPercentage: number;
  discountMode: string;
  discountDescription: string;
  serviceChargeRemovedBy: string;
  serviceChargeAddedBy: string;
  coinsGivenBy: string;
  discountGivenBy: string;
  discountRemovedBy: string;
  tipsGivenBy: string;
}

const TempModelSchema = new mongoose.Schema({
  hiCode: {
    type: String,
  },
  tableId: {
    type: String,
    default: "",
    index: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },

  claimedAmount: {
    type: Number,
    default: 0,
  },

  tipsAmount: {
    type: Number,
    default: 0,
  },
  serviceChargeApply: {
    type: Boolean,
    default: true,
  },
  mode: {
    type: String,
  },
  duesPersonId: {
    type: String,
  },
  customerName: {
    type: String,
  },
  discountDescription: {
    type: String,
    default: "",
  },
  customerPhone: {
    type: String,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  discountMode: {
    type: String,
    default: "",
  },
  serviceChargeRemovedBy: {
    type: String,
  },
  serviceChargeAddedBy: {
    type: String,
  },
  coinsGivenBy: {
    type: String,
  },
  discountGivenBy: {
    type: String,
  },
  discountRemovedBy: {
    type: String,
  },
  tipsGivenBy: {
    type: String,
  },
});

TempModelSchema.statics.build = (attrs: TempModel) => {
  return new TempModel(attrs);
};

const TempModel = mongoose.model<TempModelDoc, TempModelModel, {}>(
  "TempModel",
  TempModelSchema
);

export { TempModel };
