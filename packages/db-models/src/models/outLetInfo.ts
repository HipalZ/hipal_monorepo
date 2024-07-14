import mongoose from 'mongoose';

import type { Model } from 'mongoose';
import type { OutLetInfoType } from '../validators';
import { Amenities } from '../validators';
const outLetInfoSchema = new mongoose.Schema<OutLetInfoType>({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'Business',
  },
  name: {
    type: String,
    required: false,
  },
  fssai: {
    type: String,
    required: false,
  },
  gst: {
    type: String,
    required: false,
  },
  specialBannerUrl: {
    type: String,

    required: false,
  },
  logoUrl: {
    type: String,

    required: false,
  },
  description: {
    type: String,

    required: false,
  },
  tags: [
    {
      type: String,
    },
  ],
  phone: {
    type: String,

    required: false,
  },
  location: {
    type: String,

    required: false,
  },
  amenities: [
    {
      type: String,
      enum: Amenities,
      required: false,
    },
  ],
  customTiming: [
    {
      type: [],
      required: false,
    },
  ],
  footerDescription: {
    type: String,

    required: false,
  },
  socialMediaLinks: [
    {
      icon: {
        type: String,
        required: true,
      },
      link: {
        type: String,
        required: true,
      },
    },
  ],
  billingStartTime: {
    type: String,

    required: false,
  },
  billingEndTime: {
    type: String,

    required: false,
  },
  brandName: {
    type: String,

    required: false,
  },
  isCustomTime: {
    type: Boolean,
    default: false,
  },
  fixOpenTime: {
    type: String
  },
  fixCloseTime: {
    type: String
  },
  branchName: {
    type: String,

    required: false,
  },
});

const OutLetInfo: Model<OutLetInfoType> = mongoose.model<OutLetInfoType>('outlet', outLetInfoSchema);

export { OutLetInfo };
