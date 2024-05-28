import mongoose from "mongoose";

interface Portion {
  name: string;
  price: number;
  discount: number;
  default: boolean;
}

interface Extra {
  name: string;
  price: number;
  qty: number;
}

interface SwiggyBillObject {
  totalItems: string;
  subTotal: number;
  packingCharges: number;
  RxPayableGST: number;
  swiggyPayableGST: number;
  discount: number;
  totalPrice: number;
}

interface Dish {
  dishId: string;
  name: string;
  price: number;
  qty: number;
  comments: string;
  extras: Extra[];
  portions: Portion[];
}

interface KOTAttrs {
  businessId: string;
  kitchenId: string;
  zoneId: string;
  tableId: string;
  staffId: string;
  startedAt: number;
  cookedAt: number;
  status: string;
  dish: Dish;
  customerName: string;
  customerPhone: string;
  dishStatus: string;
  kotTime: string;
  tableName: string;
  date: string;
  instructions?: string;
  dishType: string;
  category: string;
  kotDate: string;
  priority: boolean;
  isDeleted: boolean;
  reasonForDelete: string;
  staffName: string;
  inventory: boolean;
  orderId: string;
  avgTime: number;
  taxes: [Object];
  swiggyBillObj?: any;
  match: boolean;
  isGst: boolean;
  transferBy?: string;
  switchedBy?: string;
  deletedBy?: string;
  itemAddedby?: string;
}

interface KOTModel extends mongoose.Model<KOTDoc> {
  build(attrs: KOTAttrs): KOTDoc;
}

interface KOTDoc extends mongoose.Document {
  businessId: string;
  kitchenId: string;
  zoneId: string;
  tableId: string;
  staffId: string;
  startedAt: number;
  cookedAt: number;
  status: string;
  dish: Dish;
  customerName: string;
  customerPhone: string;
  dishStatus: string;
  kotTime: string;
  tableName: string;
  date: string;
  instructions?: string;
  dishType: string;
  category: string;
  kotDate: string;
  priority: boolean;
  isDeleted: boolean;
  reasonForDelete: string;
  staffName: string;
  inventory: boolean;
  orderId: string;
  avgTime: number;
  taxes: [Object];
  swiggyBillObj?: any;
  match: boolean;
  isGst: boolean;
  transferBy?: string;
  switchedBy?: string;
  deletedBy?: string;
  itemAddedby?: string;
}

const KOTSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    kitchenId: {
      type: String,
      required: false,
    },
    zoneId: {
      type: String,
      required: false,
    },
    tableId: {
      type: String,
      required: false,
    },
    staffId: {
      type: String,
      required: false,
    },
    startedAt: {
      type: Number,
      required: false,
    },
    cookedAt: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    dish: {
      type: Object,
      required: true,
    },
    customerName: {
      type: String,
      required: false,
    },
    customerPhone: {
      type: String,
      required: false,
    },
    dishStatus: {
      type: String,
      enum: ["cooking", "cooked", "delivered"],
      default: "cooking",
    },
    kotTime: {
      type: String,
      default: "",
    },
    tableName: {
      type: String,
      default: "",
    },
    dishType: String,
    category: String,
    date: {
      type: String,
      default: "",
    },
    instructions: {
      type: String,
      required: false,
    },
    kotDate: String,
    priority: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    reasonForDelete: {
      type: String,
    },
    staffName: {
      type: String,
    },
    inventory: {
      type: Boolean,
      default: false,
    },
    orderId: String,
    avgTime: Number,
    taxes: { type: [Object], default: null },
    swiggyBillObj: {
      type: Object,
      default: null,
    },
    match: {
      type: Boolean,
      default: true,
    },
    isGst: {
      type: Boolean,
      default: true,
    },
    transferBy: {
      type: String,
    },
    switchedBy: {
      type: String,
    },
    deletedBy: {
      type: String,
    },
    itemAddedby: {
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

KOTSchema.statics.build = (attrs: KOTAttrs) => {
  return new KOT(attrs);
};

const KOT = mongoose.model<KOTDoc, KOTModel, {}>("KOT", KOTSchema);

export { KOT };
