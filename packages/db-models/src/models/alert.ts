import mongoose, { Model } from 'mongoose';
import { AlertType } from '../validators';

const alertSchema = new mongoose.Schema<AlertType>(
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
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayAcquirerData: {
      type: Object,
      default: '',
    },
    mode: {
      type: String,
      default: '',
    },
    razorpayEventId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

const Alert: Model<AlertType> = mongoose.model<AlertType>('Alert', alertSchema);

export { Alert };
