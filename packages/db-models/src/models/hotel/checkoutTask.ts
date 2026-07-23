import type { Model } from "mongoose";
import mongoose from "mongoose";
import type {
  HotelCheckoutGroupType,
  HotelCheckoutTaskType,
} from "../../validators";
import {
  checkoutTaskStageEnum,
  checkoutTaskStatusEnum,
} from "../../validators/hotel/checkoutTask";

const ObjectId = mongoose.Schema.Types.ObjectId;

/** Which services a checkout raises, and the SLA this module holds them to. */
const hotelCheckoutGroupSchema = new mongoose.Schema<HotelCheckoutGroupType>({
  businessId: { type: ObjectId, required: true, ref: "Business" },
  name: { type: String, required: true, default: "Room checkout" },
  isActive: { type: Boolean, default: true },
  services: {
    type: [
      {
        _id: false,
        serviceId: { type: ObjectId, required: true, ref: "hotelservice" },
        acceptMins: { type: Number, default: 2 },
        completeMins: { type: Number, default: 45 },
      },
    ],
    default: [],
  },
  floorWindowMins: { type: Number, default: 2 },
  widenToOtherFloors: { type: Boolean, default: false },
  otherFloorsWindowMins: { type: Number, default: 2 },
  notifyManager: { type: Boolean, default: true },
});

hotelCheckoutGroupSchema.index({ businessId: 1, isActive: 1 });

const hotelCheckoutTaskSchema = new mongoose.Schema<HotelCheckoutTaskType>({
  businessId: { type: ObjectId, required: true, ref: "Business" },
  roomId: { type: ObjectId, required: true, ref: "hotelroom" },
  zoneId: { type: ObjectId, required: false, ref: "hotelzone" },
  groupId: { type: ObjectId, required: true, ref: "hotelcheckoutgroup" },
  serviceId: { type: ObjectId, required: true, ref: "hotelservice" },
  checkoutRef: { type: String, required: true },
  acceptMins: { type: Number, required: true },
  completeMins: { type: Number, required: true },
  guestName: { type: String, required: false },
  guestPhone: { type: String, required: false },
  // Every occupant at checkout, in the room's own order: index 0 is the primary
  // guest, the rest are companions. guestName/guestPhone above mirror guests[0]
  // so existing readers keep working. Copied, not referenced — a later profile
  // edit must not rewrite who this checkout recorded.
  guests: {
    type: [
      {
        _id: false,
        userId: { type: ObjectId, required: false, ref: "User" },
        name: { type: String, required: false },
        phone: { type: String, required: false },
      },
    ],
    default: [],
  },
  status: { type: String, enum: checkoutTaskStatusEnum, default: "PENDING" },
  stage: { type: String, enum: checkoutTaskStageEnum, default: "FLOOR" },
  audienceStaffIds: { type: [ObjectId], default: [], ref: "User" },
  createdAt: { type: Number, required: true },
  acceptDueAt: { type: Number, required: true },
  completeDueAt: { type: Number, required: false },
  acceptedAt: { type: Number, required: false },
  acceptedBy: { type: ObjectId, required: false, ref: "User" },
  completedAt: { type: Number, required: false },
  completedBy: { type: ObjectId, required: false, ref: "User" },
  escalatedAt: { type: Number, required: false },
  overdueNotifiedAt: { type: Number, required: false },
  triggeredBy: { type: ObjectId, required: false, ref: "User" },
});

// One task per service per checkout — a retried or double-tapped trigger hits
// this index instead of raising the cleaning request twice.
hotelCheckoutTaskSchema.index(
  { checkoutRef: 1, serviceId: 1 },
  { unique: true },
);
// The sweeper's query.
hotelCheckoutTaskSchema.index({ status: 1, acceptDueAt: 1 });
// The staff feed.
hotelCheckoutTaskSchema.index({ audienceStaffIds: 1, status: 1 });

const HotelCheckoutGroup: Model<HotelCheckoutGroupType> =
  mongoose.model<HotelCheckoutGroupType>(
    "hotelcheckoutgroup",
    hotelCheckoutGroupSchema,
  );

const HotelCheckoutTask: Model<HotelCheckoutTaskType> =
  mongoose.model<HotelCheckoutTaskType>(
    "hotelcheckouttask",
    hotelCheckoutTaskSchema,
  );

export { HotelCheckoutGroup, HotelCheckoutTask };
