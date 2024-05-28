import mongoose from "mongoose";

interface AlertAttrs {
  businessId: string;
  zoneId: string;
  tableName: string;
  tableId: string;
  staffId: string;
  status: string;
  time: number;
  message: string;
  isAlertOn: boolean;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpayAcquirerData: Object;
  razorpayEventId?: string;
  mode: string;
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
  time: number;
  message: string;
  isAlertOn: boolean;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpayAcquirerData: Object;
  razorpayEventId?: string;
  mode: string;
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
      type: Number,
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
    razorpayPaymentId: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayAcquirerData: {
      type: Object,
    },
    mode: {
      type: String,
    },
    razorpayEventId: {
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

alertSchema.statics.build = (attrs: AlertAttrs) => {
  return new Alert(attrs);
};

const Alert = mongoose.model<AlertDoc, AlertModel, {}>(
  "paymentalert",
  alertSchema
);

export { Alert };
