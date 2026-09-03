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
    required: false,
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

  wakeUpAt: {
    type: Number,
    required: false,
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

  // Front-office staff who raised the request for the guest; null if the guest
  // raised it themselves.
  raisedByStaff: {
    type: ObjectId,
    required: false,
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
  cart: {
    type: [Object],
    required: false,
  },
  roomChatComplainId: {
    type: ObjectId,
    required: false,
    ref: "hotelroomchatcomplain",
    default: null,
  },
  message: {
    type: String,
    required: false,
  },
  isEscalated: {
    type: Boolean,
    required: false,
    default: false,
  },
  level: {
    type: Number,
    required: false,
    default: 1,
  },
});

hotelAlertSchema.index({ businessId: 1, createdAt: -1, alertProgress: 1 });

const HotelAlert: Model<HotelAlertType> = mongoose.model<HotelAlertType>(
  "hotelalert",
  hotelAlertSchema,
);
export { HotelAlert };
