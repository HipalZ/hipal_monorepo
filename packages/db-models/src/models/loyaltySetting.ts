import mongoose, { type Model } from 'mongoose';
import type { LoyaltyType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;

const loyaltySchema = new mongoose.Schema<LoyaltyType>(
  {
    businessId: {
      type: ObjectId,
      ref: 'Business',
      required: true,
      unique: true,
    },
    setCashBackPercentage: {
      type: Number,
      required: true,
    },
    setClaimedPercentage: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      default: '1234',
    },
    loyaltyId: {
      type: ObjectId,
      required: true,
      ref: 'LoyaltySetting',
    },
    origin: {
      type: Boolean,
      default: false,
    },
    cardPattern: {
      type: String,
      default: 'beans',
    },

    cardColor: {
      type: String,
      default: '22341F',
    },
    fontColor: {
      type: String,
      default: 'FAE8CA',
    },
    logo: {
      type: String,
      default: '',
    },

    loyaltyExpiryDate: {
      type: Number,
    },
    rewardLimit: {
      type: Number,
      default: 4999
    },
    signUpBonus: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const LoyaltySettings: Model<LoyaltyType> = mongoose.model<LoyaltyType>('LoyaltySetting', loyaltySchema);

export { LoyaltySettings };
