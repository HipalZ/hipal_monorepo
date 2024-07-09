import type { Model } from 'mongoose';
import mongoose from 'mongoose';
import type { OutletType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;
const businessSchema = new mongoose.Schema<OutletType>(
  {
    outletName: {
      type: String,
      required: true,
    },

    outletType: {
      type: String,
      enum: ['FOOD', 'OTHER'],

      required: true,
    },

    multipleOutlets: {
      type: Boolean,
      required: true,
      default: false,
    },
    parent_outlet_id: {
      type: ObjectId,
      required: false,
      ref: 'outlet',
    },
    customLink: {
      type: String,
      required: true,
      unique: true,
    },

    staffIds: {
      type: [ObjectId],
      required: true,
      ref: 'User',
    },
    gstNumber: {
      type: String,
      default: '',
      required: false,
    },
    fssaiLicenseNumber: {
      type: String,
      default: '',
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
      default: false,
    },

    withPopCorn: {
      type: Boolean,
      default: false,
    },
    cloneParentOutletData: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Outlet: Model<OutletType> = mongoose.model<OutletType>('outlet', businessSchema);

export { Outlet };
