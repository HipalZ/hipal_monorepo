import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { UserKotType } from "../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

const zoneSchema = new mongoose.Schema<UserKotType>(
  {
    name: {
      type: String,
      required: true,
    },
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    phone: {
      type: String,
      required: true,
    },
    tableName: {
      type: String,
      required: true,
    },
    cart: {
      type: [Object],
      required: true,
    },
    date: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const UserKot: Model<UserKotType> = mongoose.model<UserKotType>(
  "userkot",
  zoneSchema,
);

export { UserKot };
