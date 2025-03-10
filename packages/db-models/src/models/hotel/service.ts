import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelServiceType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const hotelServiceSchema = new mongoose.Schema<HotelServiceType>({
  availability: {
    type: Boolean,
    required: false,
    default: true,
  },
  name: {
    type: String,
    required: true,
  },
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
  image: {
    type: String,
    required: false,
  },
});

const HotelService: Model<HotelServiceType> = mongoose.model<HotelServiceType>(
  "hotelservice",
  hotelServiceSchema,
);
export { HotelService };
