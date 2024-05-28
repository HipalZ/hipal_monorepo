import mongoose from "mongoose";

interface AlertAttrs {
  businessId: string;
  zoneId: string;
  tableName: string;
  tableId: string;
  staffId: string;
  status: string;
  time: string;
  message: string;
  kotId: string;
  isAlertOn: boolean;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpayAcquirerData: Object;
  mode: string;
  razorpayEventId: string;
}

interface AlertModel extends mongoose.Model<AlertDoc> {
  build(attrs: AlertAttrs): AlertDoc;
}

interface AlertDoc extends mongoose.Document {
  businessId: string;
  zoneId: string;
  tableName: string;
  tableId: string;
  staffId: string;
  status: string;
  time: string;
  message: string;
  kotId: string;
  isAlertOn: boolean;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpayAcquirerData: Object;
  mode: string;
  razorpayEventId: string;
}

const alertSchema = new mongoose.Schema(
  {
    businessId: {
      required: true,
      type: String,
    },
    tableName: {
      type: String,
    },
    tableId: {
      type: String,
    },
    staffId: {
      type: String,
    },
    status: {
      type: String,
    },
    time: {
      type: String,
    },
    message: {
      type: String,
    },
    isAlertOn: {
      type: Boolean,
      default: true,
    },
    zoneId: {
      type: String,
    },
    kotId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayAcquirerData: {
      type: Object,
      default: "",
    },
    mode: {
      type: String,
      default: "",
    },
    razorpayEventId: {
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

alertSchema.statics.build = (attrs: AlertAttrs) => {
  return new Alert(attrs);
};

const Alert = mongoose.model<AlertDoc, AlertModel, {}>("Alert", alertSchema);

export { Alert };
