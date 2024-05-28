import mongoose from "mongoose";

interface LoyaltyAttrs {
  businessId: string;
  loyaltyId: string;
  setReward: number;
  setClaimAmount: number;
  password: string;
  origin: boolean;
  cardPattern: string;
  cardColor: string;
  fontColor: string;
  logo: string;
  expiryDate: string;
  rewardLimit: number;
}

interface LoyaltyModel extends mongoose.Model<LoyaltyDoc> {
  build(attrs: LoyaltyAttrs): LoyaltyDoc;
}

interface LoyaltyDoc extends mongoose.Document {
  businessId: string;
  setReward: number;
  setClaimAmount: number;
  loyaltyId: string;
  password: string;
  origin: boolean;
  cardPattern: string;
  cardColor: string;
  fontColor: string;
  logo: string;
  expiryDate: string;
  rewardLimit: number;
}

const loyaltySchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    setReward: {
      type: Number,
    },
    setClaimAmount: {
      type: Number,
    },
    password: {
      type: String,
      default: "1234",
    },
    loyaltyId: String,
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
    logo: String,
    expiryDate: {
      type: String,
    },
    rewardLimit: {
      type: Number,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

loyaltySchema.statics.build = (attrs: LoyaltyAttrs) => {
  return new LoyaltySettings(attrs);
};

const LoyaltySettings = mongoose.model<LoyaltyDoc, LoyaltyModel, {}>(
  "LoyaltySetting",
  loyaltySchema
);

export { LoyaltySettings };
