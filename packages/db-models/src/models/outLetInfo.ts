import mongoose from 'mongoose';

import type { Model } from 'mongoose';
import type { OutLetInfoType } from '../validators';
const outLetInfoSchema = new mongoose.Schema<OutLetInfoType>({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'Business',
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
      enum: ['SMOKING SECTION', 'BUFFET', 'PARKING', 'HI SPEED WIFI', 'CHILD FRIENDLY', 'ALCOHOL', 'DELIVERY', 'TAKEAWAY', 'DINEIN', 'RESERVATION'],
      required: false,
    },
  ],
  timing: [
    {
      type: String,
      required: false,
    },
  ],
});

const OutLetInfo: Model<OutLetInfoType> = mongoose.model<OutLetInfoType>('outlet', outLetInfoSchema);

export { OutLetInfo };
