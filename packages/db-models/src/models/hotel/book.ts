import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelBookRoomType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const hotelRoomBookSchema = new mongoose.Schema<HotelBookRoomType>({
  businessId: {
    type: ObjectId,
    required: true,
  },
  checkIn: {
    type: Number,
    required: true,
  },
  checkOut: {
    type: Number,
    required: true,
  },
  roomIds: {
    type: [ObjectId],
    required: true,
    ref: "hotelroom",
  },
  userId: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  adults: {
    type: Number,
    required: true,
  },
  children: {
    type: Number,
    required: false,
    default: 0,
  },
  date: {
    type: Number,
    required: false,
  },
  status: {
    type: String,
    required: false,
    default: "PENDING",
  },
});

const HotelRoomBooking: Model<HotelBookRoomType> =
  mongoose.model<HotelBookRoomType>("hotelroombooking", hotelRoomBookSchema);
export { HotelRoomBooking };
