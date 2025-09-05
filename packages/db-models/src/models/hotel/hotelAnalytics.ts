import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelAnalyticsType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const hotelAnalyticsSchema = new mongoose.Schema<HotelAnalyticsType>({
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
  roomId: {
    type: ObjectId,
    required: true,
    ref: "hotelroom",
  },
  userId: {
    type: ObjectId,
    default: null,
    ref: "User",
  },
  checkIn: {
    type: Number,
    required: true,
    default: 0,
  },
  checkOut: {
    type: Number,
    required: true,
    default: 0,
  },
  source: {
    type: String,
    default: "not-given",
  },
  guestUserIds: {
    type: [ObjectId],
    default: [],
    ref: "User",
  },
});

const HotelAnalytics: Model<HotelAnalyticsType> =
  mongoose.model<HotelAnalyticsType>("hotelanalytics", hotelAnalyticsSchema);
export { HotelAnalytics };
