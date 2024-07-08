import mongoose, { Model } from 'mongoose';
import { Zone } from '../validators';

const zoneSchema = new mongoose.Schema<Zone>(
  {
    businessId: {
      type: String,
      required: true,
    },
    zoneName: {
      type: String,
      required: true,
    },
    zoneType: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: false,
    },
    endTime: {
      type: String,
      required: false,
    },
    staff: {
      type: [String],
      required: false,
    },
    tables: {
      type: [String],
      required: false,
    },
    Occupied: {
      type: Number,
      default: 0,
    },
    charges: {
      type: [Object],
    },
  },
  {
    timestamps: true,
  },
);

const Zone: Model<Zone> = mongoose.model<Zone>('Zone', zoneSchema);

export { Zone };
