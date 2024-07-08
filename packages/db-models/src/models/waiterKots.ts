import mongoose, { Model } from 'mongoose';
import { WaiterKotType } from '../validators';

const waiterKotSchema = new mongoose.Schema<WaiterKotType>(
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
      default: '',
    },
    acceptedBy: {
      type: String,
      default: '',
    },
    editedBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

const Waiterkot: Model<WaiterKotType> = mongoose.model<WaiterKotType>('waiterKot', waiterKotSchema);

export { Waiterkot };
