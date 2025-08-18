import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const hotelRoomTypeSchema = new mongoose.Schema<HotelType>({
  roomType: {
    type: String,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  amenities: [
    {
      type: ObjectId,
      ref: "hotelamenitie",
      required: false,
    },
  ],
  images: [
    {
      type: String,
      required: false,
    },
  ],
  businessId: {
    type: ObjectId,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  roomIds: [
    {
      type: ObjectId,
      ref: "rooms",
    },
  ],
  pricePerNight: {
    type: Number,
    required: false,
    default: 0,
  },
  size: {
    type: String,
    required: false,
  },
  capacity: {
    type: Number,
    required: false,
    default: 1,
  },
  typeOfBed: {
    type: String,
    required: false,
  },
});

const HotelRoomType: Model<HotelType> = mongoose.model<HotelType>(
  "hotelroomtype",
  hotelRoomTypeSchema,
);
export { HotelRoomType };
