import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelRoomType } from "../../validators";
import { hotelStatusEnum } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const hotelRoomsSchema = new mongoose.Schema<HotelRoomType>({
  businessId: {
    type: ObjectId,
    required: true,
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

  tax: {
    type: Number,
    required: false,
  },
  zoneId: {
    type: ObjectId,
    required: true,
    ref: "hotelzone",
  },

  capacity: {
    type: Number,
    required: false,
    default: 0,
  },
  roomStatus: {
    type: String,
    required: false,
    enum: hotelStatusEnum,
    default: "AVAILABLE",
  },
  date: {
    type: Number,
    required: false,
  },
  staffIds: {
    type: [ObjectId],
    required: false,
    default: [],
    ref: "User",
  },
  authCode: {
    type: String,
    required: false,
    default: "",
  },
  rating: {
    type: Number,
    required: false,
    default: 4.5,
  },
  size: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  images: {
    type: [String],
    required: false,
    default: [],
  },
  downLoadLink: {
    type: String,
    required: false,
  },
  userIds: {
    type: [ObjectId],
    required: false,
    default: [],
    ref: "User",
  },
  slug: {
    type: String,
    required: false,
  },
  roomTypeId: {
    type: ObjectId,
    required: true,
    ref: "hotelroomtype",
  },
  isDeleted: {
    type: Boolean,
    required: false,
    default: false,
  },
  source: {
    type: String,
    required: false,
  },
});

hotelRoomsSchema.index({ businessId: 1, name: 1 }, { unique: true });

const HotelRoom: Model<HotelRoomType> = mongoose.model<HotelRoomType>(
  "hotelroom",
  hotelRoomsSchema,
);
export { HotelRoom };
