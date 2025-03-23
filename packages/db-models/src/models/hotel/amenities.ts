import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelAmenitiesType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const hotelAmenitiesSchema = new mongoose.Schema<HotelAmenitiesType>({
  name: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: false,
  },
});

const HotelAmenities: Model<HotelAmenitiesType> =
  mongoose.model<HotelAmenitiesType>("hotelamenitie", hotelAmenitiesSchema);
export { HotelAmenities };
