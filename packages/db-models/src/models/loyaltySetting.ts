import mongoose, { Model } from "mongoose";
import { LoyaltyType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId as any;
const loyaltySchema = new mongoose.Schema<LoyaltyType>(
  {
    businessId: {
      type: ObjectId,
      ref: "Business",
      required: true,
    },
    setReward: {
      type: Number,
      required: true,
    },
    setClaimAmount: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      default: "1234",
    },
    loyaltyId: {
      type: String,
      required: true,
    },
    origin: Boolean,
    cardPattern: {
      type: String,
      default: "beans",
    },

    cardColor: {
      type: String,
      default: "22341F",
    },
    fontColor: {
      type: String,
      default: "FAE8CA",
    },
    logo: {
      type: String,
      default: "",
    },
    expiryDate: {
      type: String,
    },
    loyaltyExpiryDate: {
      type: Number,
    },
    rewardLimit: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const LoyaltySettings: Model<LoyaltyType> = mongoose.model<LoyaltyType>(
  "LoyaltySetting",
  loyaltySchema
);

export { LoyaltySettings };
