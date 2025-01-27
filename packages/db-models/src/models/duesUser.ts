import mongoose, { Schema, type Model } from "mongoose";
import type { DuesUserType } from "../validators";

// Define ObjectId for convenience
const ObjectId = Schema.Types.ObjectId;

// Main Cart Schema
const duesUserSchema = new Schema<DuesUserType>(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    totalDuesAmount: {
      type: Number,
      default: 0,
    },
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
  },
  {
    timestamps: true,
  },
);

const DuesUser: Model<DuesUserType> = mongoose.model<DuesUserType>(
  "duesuser",
  duesUserSchema,
);

export { DuesUser };
