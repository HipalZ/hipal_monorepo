import mongoose, { Model } from 'mongoose';
import { TableTypes } from '../validators';

const tableSchema = new mongoose.Schema<TableTypes>(
  {
    businessId: {
      type: String,
      required: true,
    },
    zoneId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    staff: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      default: 'Empty',
      enum: ['Occupied', 'Settled', 'Clean', 'Empty', 'Reserved', 'Need assistance', 'Active'],
    },
    activeUser: {
      type: Number,
      default: 0,
    },
    time: {
      type: String,
      default: '',
    },
    totalDishQuantity: {
      type: Number,
      default: 0,
    },
    deliverdDish: {
      type: Number,
      default: 0,
    },
    role: {
      type: Object,
      default: null,
    },
    hiCode: {
      type: String,
      default: '',
    },
    isMerge: {
      type: Boolean,
      default: false,
    },
    hierarchy: {
      type: String,
      default: '',
    },
    parentTableId: {
      type: String,
      default: '',
    },
    parentZoneId: {
      type: String,
      default: '',
    },
    mergeTables: [Object],
    mergedBy: {
      type: String,
    },
    reservedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Table: Model<TableTypes> = mongoose.model<TableTypes>('Table', tableSchema);

export { Table };
