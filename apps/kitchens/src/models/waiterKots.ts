import mongoose from "mongoose";

interface WaiterKotAttrs {
  businessId: string;
  tableName: string;
  tableId: string;
  zoneId: string;
  date: string;
  time: string;
  items: [];
  isAccept: boolean;
  isReject: boolean;
  isEdit: boolean;
  staffId: string;
  cart: Object;
  rejectedBy: string;
  acceptedBy: string;
  editedBy: string;
}

interface WaiterKotModel extends mongoose.Model<WaiterKotDoc> {
  build(attrs: WaiterKotAttrs): WaiterKotDoc;
}

interface WaiterKotDoc extends mongoose.Document {
  businessId: string;
  tableName: string;
  date: string;
  time: string;
  tableId: string;
  zoneId: string;
  items: [];
  isAccept: boolean;
  isReject: boolean;
  isEdit: boolean;
  staffId: string;
  cart: Object;
  rejectedBy: string;
  acceptedBy: string;
  editedBy: string;
}

const waiterKotSchema = new mongoose.Schema(
  {
    businessId: {
      required: true,
      type: String,
    },
    tableName: {
      type: String,
    },

    staffId: {
      required: true,
      type: String,
    },
    items: {
      required: true,
      type: [],
    },
    time: {
      type: String,
    },
    date: {
      type: String,
    },

    isAccept: {
      required: true,
      type: Boolean,
      default: false,
    },
    tableId: String,
    zoneId: String,
    cart: Object,
    isReject: {
      type: Boolean,
      default: false,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    rejectedBy: {
      type: String,
      default: "",
    },
    acceptedBy: {
      type: String,
      default: "",
    },
    editedBy: {
      type: String,
      default: "",
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

waiterKotSchema.statics.build = (attrs: WaiterKotAttrs) => {
  return new WaiterKot(attrs);
};

const WaiterKot = mongoose.model<WaiterKotDoc, WaiterKotModel, {}>(
  "waiterKot",
  waiterKotSchema
);

export { WaiterKot };
