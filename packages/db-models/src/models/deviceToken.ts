import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { DeviceTokenType } from "../validators";
// Define the Mongoose schema
const deviceTokenSchema = new mongoose.Schema<DeviceTokenType>({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Business",
    unique: true,
  },
  tokens: {
    type: [String],
    required: true,
  },
});

const DeviceToken: Model<DeviceTokenType> = mongoose.model<DeviceTokenType>(
  "DeviceToken",
  deviceTokenSchema,
);

export { DeviceToken };
