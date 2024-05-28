import mongoose from "mongoose";

interface KOTAttrs {
  businessId: string;
  userId: string;
  kitchenId: string;
  zoneId: string;
  tableId: string;
  staffId: string;
  startedAt: number;
  cookedAt: number;
  status: string;
  cart: Object;
  customerName: string;
  customerPhone: string;
}

interface KOTModel extends mongoose.Model<KOTDoc> {
  build(attrs: KOTAttrs): KOTDoc;
}

interface KOTDoc extends mongoose.Document {
  businessId: string;
  userId: string;
  kitchenId: string;
  zoneId: string;
  tableId: string;
  staffId: string;
  startedAt: number;
  cookedAt: number;
  status: string;
  cart: Object;
  customerName: string;
  customerPhone: string;
}

const KOTSchema = new mongoose.Schema({
  businessId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  kitchenId: {
    type: String,
    required: true,
  },
  zoneId: {
    type: String,
    required: true,
  },
  tableId: {
    type: String,
    required: true,
  },
  staffId: {
    type: String,
    required: true,
  },
  startedAt: {
    type: Number,
  },
  cookedAt: {
    type: Number,
    required: false,
  },
  status: {
    type: String,
  },
  cart: {
    type: Object,
    required: true,
  },
  customerName: {
    type: String,
  },
  customerPhone: {
    type: String,
    required: false,
  },
});

KOTSchema.statics.build = (attrs: KOTAttrs) => {
  return new orderHistory(attrs);
};

const orderHistory = mongoose.model<KOTDoc, KOTModel, {}>(
  "orderHistory",
  KOTSchema
);

export { orderHistory };
