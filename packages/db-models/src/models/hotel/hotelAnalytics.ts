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
  userIds: {
    type: [ObjectId],
    default: [],
    ref: "User",
  },
  date: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    default: "whatsapp",
  },
});

const HotelAnalytics: Model<HotelAnalyticsType> =
  mongoose.model<HotelAnalyticsType>("hotelanalytics", hotelAnalyticsSchema);
export { HotelAnalytics };
