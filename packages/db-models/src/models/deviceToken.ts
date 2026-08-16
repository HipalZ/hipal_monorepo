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
    maxlength: 700,
    unique: true,
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
