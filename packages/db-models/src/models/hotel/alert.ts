import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelAlertType } from "../../validators";
import { alertProgressEnum } from "../../validators/hotel/alert";
const ObjectId = mongoose.Schema.Types.ObjectId;
const hotelAlertSchema = new mongoose.Schema<HotelAlertType>({
  alertProgress: {
    type: String,
    enum: alertProgressEnum,
    default: "CREATED",
  },

  serviceIds: {
    type: [ObjectId],
    required: true,
    ref: "hotelservice",
  },

  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },

  userId: {
    type: ObjectId,
    required: true,
    ref: "User",
  },

  createdAt: {
    type: Number,
    required: true,
  },

  acceptedAt: {
    type: Number,
    required: false,
  },

  deliveredAt: {
    type: Number,
    required: false,
  },

  rejectedAt: {
    type: Number,
    required: false,
  },

  createdBy: {
    type: ObjectId,
    required: true,
    ref: "User",
  },

  acceptedBy: {
    type: ObjectId,
    required: false,
    ref: "User",
  },

  deliveredBy: {
    type: ObjectId,
    required: false,
    ref: "User",
  },

  rejectedBy: {
    type: ObjectId,
    required: false,
    ref: "User",
  },

  roomId: {
    type: ObjectId,
    required: false,
    ref: "hotelroom",
  },
});

const HotelAlert: Model<HotelAlertType> = mongoose.model<HotelAlertType>(
  "hotelalert",
  hotelAlertSchema,
);
export { HotelAlert };
