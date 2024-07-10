import mongoose, { type Model } from 'mongoose';
import type { TempModelType } from '../validators';

const TempModelSchema = new mongoose.Schema<TempModelType>({
  hiCode: {
    type: String,
  },
  tableId: {
    type: String,
    default: '',
    index: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },

  claimedAmount: {
    type: Number,
    default: 0,
  },

  tipsAmount: {
    type: Number,
    default: 0,
  },
  serviceChargeApply: {
    type: Boolean,
    default: true,
  },
  mode: {
    type: String,
  },
  duesPersonId: {
    type: String,
  },
  customerName: {
    type: String,
  },
  discountDescription: {
    type: String,
    default: '',
  },
  customerPhone: {
    type: String,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  discountMode: {
    type: String,
    default: '',
  },
  serviceChargeRemovedBy: {
    type: String,
  },
  serviceChargeAddedBy: {
    type: String,
  },
  coinsGivenBy: {
    type: String,
  },
  discountGivenBy: {
    type: String,
  },
  discountRemovedBy: {
    type: String,
  },
  tipsGivenBy: {
    type: String,
  },
});

const Tempmodel: Model<TempModelType> = mongoose.model<TempModelType>('TempModel', TempModelSchema);

export { Tempmodel };
