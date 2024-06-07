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
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    staff: {
      type: [String],
      required: true,
    },
    tables: {
      type: [String],
      required: true,
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
