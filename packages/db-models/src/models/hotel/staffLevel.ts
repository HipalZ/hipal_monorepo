import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelStaffLevelType } from "../../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;
const hotelStaffLevelSchema = new mongoose.Schema<HotelStaffLevelType>({
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
    default: 1,
  },
  nextLevelTime: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
    default: 5,
  },
  staffIds: {
    type: [ObjectId],
    required: true,
    ref: "User",
  },
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
});

const HotelStaffLevel: Model<HotelStaffLevelType> =
  mongoose.model<HotelStaffLevelType>("hotelstafflevel", hotelStaffLevelSchema);
export { HotelStaffLevel };
