import mongoose, { type Model } from 'mongoose';
import type { BusinessRoleType } from '../validators';

const roleSchema = new mongoose.Schema<BusinessRoleType>(
  {
    name: {
      type: String,
      enum: ['MANAGER','CO_OWNER',"CAPTAIN", "MARKETING_AGENT", 'RESTAURANT_OWNER'],
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    permissions: {
      type: [String],
      required: false,
    },
    businessId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Role: Model<BusinessRoleType> = mongoose.model<BusinessRoleType>('Role', roleSchema);

export { Role };
