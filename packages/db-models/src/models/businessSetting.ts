import mongoose, { type Model } from 'mongoose';
import { RegisterType } from '../validators/businessSetting';
const { Schema } = mongoose;

import type { BusinessSettingsType } from '../validators';

const businessSettingSchema = new Schema<BusinessSettingsType>({
  businessId: { type: Schema.Types.ObjectId, required: true },
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
});

const BusinessSettings: Model<BusinessSettingsType> = mongoose.model<BusinessSettingsType>('setting', businessSettingSchema);

export { BusinessSettings };
