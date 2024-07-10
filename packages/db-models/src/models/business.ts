import type { Model } from 'mongoose';
import mongoose from 'mongoose';
import type { BusinessType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;
const businessSchema = new mongoose.Schema<BusinessType>(
  {
    name: {
      type: String,
      required: true,
    },

    businessType: {
      type: String,
      enum: ['FOOD', 'OTHER'],

      required: true,
    },

    multipleOutlets: {
      type: [ObjectId],
      required: false,

      ref: 'Business',
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

    isActive: {
      type: Boolean,
      required: false,
      default: false,
    },

    // withPopCorn: {
    //   type: Boolean,
    //   default: false,
    // },
    // cloneParentBusinessData: {
    //   type: Boolean,
    //   default: false,
    // },

    exploreLayout: {
      type: String,
      enum: ['BUTTER', 'SUNFLOWER'],
      required: false,
    },
    menuLayout: {
      type: String,
      enum: ['MAIN_CATEGORY', 'MAIN_AND_SUB_CATEGORY'],
    },
    primaryColor: {
      type: String,
    },
    secondaryColor: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Business: Model<BusinessType> = mongoose.model<BusinessType>('Business', businessSchema);

export { Business };
