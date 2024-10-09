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
  },
  notification: {
    type: Boolean,
    default: true,
  },
});

deviceTokenSchema.index({ businessId: 1, userId: 1 }, { unique: true });

const DeviceToken: Model<DeviceTokenType> = mongoose.model<DeviceTokenType>(
  "DeviceToken",
  deviceTokenSchema,
);

export { DeviceToken };
