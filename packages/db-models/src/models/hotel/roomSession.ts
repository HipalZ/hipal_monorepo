import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelRoomSessionType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const hotelRoomsSessionSchema = new mongoose.Schema<HotelRoomSessionType>({
  roomId: {
    type: ObjectId,
    required: true,
    ref: "hotelroom",
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },

  checkIn: {
    type: Number,
    required: false,
  },

  userIds: {
    type: [ObjectId],
    required: false,
    default: [],
  },

  date: {
    type: Number,
    required: false,
  },

  checkOut: {
    type: Number,
    required: false,
  },

  authCode: {
    type: String,
    required: true,
  },
  isAuthCodeVerified: {
    type: Boolean,
    required: false,
    default: false,
  },
  source: {
    type: String,
    required: false,
  },
  
});

const HotelRoomSession: Model<HotelRoomSessionType> =
  mongoose.model<HotelRoomSessionType>(
    "hotelroomsession",
    hotelRoomsSessionSchema,
  );
export { HotelRoomSession };
