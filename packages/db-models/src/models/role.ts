import mongoose, { type Model } from 'mongoose';
import type { BusinessRoleType } from '../validators';

const roleSchema = new mongoose.Schema<BusinessRoleType>(
  {
    name: {
      type: String,
      enum: ['RESTAURANT_MANAGER', 'RESTAURANT_FLOOR_MANAGER', 'RESTAURANT_STAFF', 'OPERATOR', 'RESTAURANT_OWNER'],
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
