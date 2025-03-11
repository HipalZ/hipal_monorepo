import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelZonesType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const hotelZonesSchema = new mongoose.Schema<HotelZonesType>({
  businessId: {
    type: ObjectId,
    required: true,
  },
  amenities: {
    type: [ObjectId],
    required: false,
    default: [],
    ref: "hotelamenitie",
  },
  availability: {
    type: Boolean,
    required: false,
    default: true,
  },
  name: {
    type: String,
    required: true,
  },
  roomIds: {
    type: [ObjectId],
    required: false,
    default: [],
    ref: "hotelroom",
  },
  tax: {
    type: Number,
    required: false,
  },
});

hotelZonesSchema.index({ businessId: 1, name: 1 }, { unique: true });

const HotelZone: Model<HotelZonesType> = mongoose.model<HotelZonesType>(
  "hotelzone",
  hotelZonesSchema,
);
export { HotelZone };
