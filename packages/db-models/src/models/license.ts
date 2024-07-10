import mongoose, { type Model } from 'mongoose';
import type { LicenseType } from '../validators';
const { Schema } = mongoose;
const licenseSchema = new Schema<LicenseType>({
  businessId: { type: Schema.Types.ObjectId, required: true, ref: 'Business' },
  withPopcorn: { type: Boolean, default: false },
});

const License: Model<LicenseType> = mongoose.model<LicenseType>('License', licenseSchema);

export { License };
