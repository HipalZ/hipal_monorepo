import mongoose from "mongoose";

interface PaidKot {
  hiCode: string;
  tableId: string;
  discount: number;
  discountTableId: string;
  claimedTableId: string;
  claimedAmount: number;
  tipsTableId: string;
  tipsAmount: number;
}

interface PaidKotModel extends mongoose.Model<PaidKotDoc> {
  build(attrs: PaidKot): PaidKotDoc;
}

interface PaidKotDoc extends mongoose.Document {
  hiCode: string;
  tableId: string;
  discount: number;
  discountTableId: string;
  claimedTableId: string;
  claimedAmount: number;
  tipsTableId: string;
  tipsAmount: number;
}

const paidKotSchema = new mongoose.Schema({
  hiCode: {
    type: String,
  },
  tableId: {
    type: String,
    default: "",
    index: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  discountTableId: {
    type: String,
    default: "",
  },
  claimedTableId: {
    type: String,
    default: "",
  },
  claimedAmount: {
    type: Number,
    default: 0,
  },
  tipsTableId: {
    type: String,
    default: "",
  },
  tipsAmount: {
    type: Number,
    default: 0,
  },
});

paidKotSchema.statics.build = (attrs: PaidKot) => {
  return new PaidKot(attrs);
};

const PaidKot = mongoose.model<PaidKotDoc, PaidKotModel, {}>(
  "PaidKot",
  paidKotSchema
);

export { PaidKot };
