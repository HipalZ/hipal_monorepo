import mongoose, { Schema, type Model } from "mongoose";
import type { NpcUserType } from "../validators";

// Define ObjectId for convenience
const ObjectId = Schema.Types.ObjectId;

// Main Cart Schema
const npcUserSchema = new Schema<NpcUserType>(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    totalNpcAmount: {
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

const NpcUser: Model<NpcUserType> = mongoose.model<NpcUserType>(
  "npcuser",
  npcUserSchema,
);

export { NpcUser };
