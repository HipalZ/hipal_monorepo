import type { Model } from 'mongoose';
import mongoose from 'mongoose';
import type { BusinessType } from '../validators';
import { BusinessEnumType, ExploreLayout, MenuLayout } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;
const businessSchema = new mongoose.Schema<BusinessType>(
  {
    name: {
      type: String,
      required: true,
    },

    businessType: {
      type: String,
      enum: BusinessEnumType,

      required: false,
    },
    parentOutLetId: {
      type: ObjectId,
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
    exploreLayout: {
      type: String,
      enum: ExploreLayout,
      required: false,
    },
    menuLayout: {
      type: String,
      enum: MenuLayout,
    },
    primaryColor: {
      type: String,
    },
    secondaryColor: {
      type: String,
    },
    outlet: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Business: Model<BusinessType> = mongoose.model<BusinessType>('Business', businessSchema);

export { Business };
