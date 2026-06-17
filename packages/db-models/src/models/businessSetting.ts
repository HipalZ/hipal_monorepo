import mongoose, { type Model } from "mongoose";
import { NotificationSound, RegisterType } from "../validators/businessSetting";
const ObjectId = mongoose.Schema.Types.ObjectId;

import type { BusinessSettingsType } from "../validators";

const businessSettingSchema = new mongoose.Schema<BusinessSettingsType>({
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
    index: true,
    unique: true,
  },
  registerName: { type: String, required: false },
  registerType: { type: String, enum: RegisterType, required: false },
  establishmentYear: { type: String, required: false },
  panNumber: { type: String, required: false },
  gstNumber: { type: String, required: false },
  bankName: { type: String, required: false },
  accountNumber: { type: String, required: false },
  ifscCode: { type: String, required: false },
  branchName: { type: String, required: false },
  beneficiaryName: { type: String, required: false },
  razorpayMerchantId: { type: String, required: false },
  razorpayKeyId: { type: String, required: false },
  razorpayKeySecret: { type: String, required: false },
  razorpayWebhookSecret: { type: String, required: false },
  notificationSound: {
    type: String,
    enum: NotificationSound,
    required: false,
    default: "order",
  },
  isActive: { type: Boolean, default: true },
});

const BusinessSettings: Model<BusinessSettingsType> =
  mongoose.model<BusinessSettingsType>("setting", businessSettingSchema);

export { BusinessSettings };
