import mongoose, { Model } from "mongoose";
import { Loyalty } from "../validators"

const loyaltySchema = new mongoose.Schema<Loyalty>(
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
        timestamps: true,
    }
);

const LoyaltySettings: Model<Loyalty> = mongoose.model<Loyalty>(
    "LoyaltySetting",
    loyaltySchema
);

export { LoyaltySettings };
