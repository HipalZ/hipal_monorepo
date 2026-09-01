import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelNotificationJobType } from "../../validators/hotel/notificationJob";
import { hotelNotificationJobStatusEnum } from "../../validators/hotel/notificationJob";

const ObjectId = mongoose.Schema.Types.ObjectId;
const HOTEL_NOTIFICATION_JOB_TTL_MS = 36 * 60 * 60 * 1000;

const hotelNotificationJobSchema = new mongoose.Schema<HotelNotificationJobType>({
  businessId: { type: ObjectId, required: true, ref: "Business" },
  alertId: { type: ObjectId, required: false, ref: "hotelalert" },
  targetUserIds: { type: [ObjectId], default: [], ref: "User" },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Map, of: String, default: {} },
  status: {
    type: String,
    enum: hotelNotificationJobStatusEnum,
    default: "PENDING",
  },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 8 },
  nextAttemptAt: { type: Number, required: true },
  lockedUntil: { type: Number, required: false },
  lastError: { type: String, required: false },
  createdAt: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + HOTEL_NOTIFICATION_JOB_TTL_MS),
  },
  sentAt: { type: Number, required: false },
});

hotelNotificationJobSchema.index({ status: 1, nextAttemptAt: 1, createdAt: 1 });
hotelNotificationJobSchema.index({ status: 1, lockedUntil: 1 });
hotelNotificationJobSchema.index({ businessId: 1, alertId: 1 });
hotelNotificationJobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const HotelNotificationJob: Model<HotelNotificationJobType> =
  mongoose.model<HotelNotificationJobType>(
    "hotelnotificationjob",
    hotelNotificationJobSchema,
  );

export { HotelNotificationJob };
