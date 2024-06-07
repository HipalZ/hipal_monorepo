import mongoose, { Model } from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

import { AdminType } from '../validators';

const adminSchema = new mongoose.Schema<AdminType>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },

    customRole: {
      type: [Object],
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const Admin: Model<AdminType> = mongoose.model<AdminType>('Admin', adminSchema);

export { Admin };
