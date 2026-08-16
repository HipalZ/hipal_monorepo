import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { DeviceTokenType } from "../validators";
// Define the Mongoose schema
const deviceTokenSchema = new mongoose.Schema<DeviceTokenType>({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Business",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 1000,
    unique: true,
  },
  provider: {
    type: String,
    enum: ["fcm", "expo", "apns"],
    default: "fcm",
  },
  platform: {
    type: String,
    enum: ["android", "ios", "web", "unknown"],
    default: "unknown",
  },
  app: {
    type: String,
    default: "hitable",
  },
  notification: {
    type: Boolean,
    default: true,
  },
  appUrl: {
    type: String,
  },
  v: {
    type: Number,
  },
  updateFeature: {
    type: [String],
    default: [],
  },
});

deviceTokenSchema.index({ businessId: 1, userId: 1, notification: 1 });

const DeviceToken: Model<DeviceTokenType> = mongoose.model<DeviceTokenType>(
  "DeviceToken",
  deviceTokenSchema,
);

export { DeviceToken };
