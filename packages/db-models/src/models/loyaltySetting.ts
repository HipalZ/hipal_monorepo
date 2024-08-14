import mongoose, { type Model } from "mongoose";
import type { LoyaltyType } from "../validators";
import { CardLayoutEnum, CardPatternEnum } from "../validators/loyaltySetting";

const ObjectId = mongoose.Schema.Types.ObjectId;

const loyaltySchema = new mongoose.Schema<LoyaltyType>(
  {
    businessId: {
      type: ObjectId,
      ref: "Business",
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
      default: "1234",
    },
    loyaltyId: {
      type: ObjectId,
      required: true,
    },
    origin: {
      type: Boolean,
      default: false,
    },
    cardType: {
      type: String,
      enum: CardPatternEnum,
      required: false,
      default: "CARD_ONE",
    },
    cardLayout: {
      type: String,
      enum: CardLayoutEnum,
      required: false,
      default: "LAYOUT_ONE",
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
    termAndCondition: {
      type: String,
      default: "",
    },

    loyaltyExpiryDate: {
      type: Number,
      required: true,
    },
    loyaltyStartDate: {
      type: Number,
      required: true,
    },
    rewardLimit: {
      type: Number,
      default: 4999,
    },
    signUpBonus: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const LoyaltySettings: Model<LoyaltyType> = mongoose.model<LoyaltyType>(
  "LoyaltySetting",
  loyaltySchema,
);

export { LoyaltySettings };
