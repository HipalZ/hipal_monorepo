import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { BusinessPosConfigType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const businessPosConfigSchema = new mongoose.Schema<BusinessPosConfigType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
      unique: true,
    },
    posId: {
      type: ObjectId,
      required: true,
      ref: "pos",
    },
    orderMode: {
      type: String,
      required: true,
      enum: ["WITH_ORDER", "WITHOUT_ORDER"],
    },
    orderVerificationType: {
      type: String,
      required: false,
      enum: ["USER", "CAPTAIN"],
    },
    petPoojaId: {
      type: String,
      required: true,
    },
    restName: {
      type: String,
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

const BusinessPosConfig: Model<BusinessPosConfigType> =
  mongoose.model<BusinessPosConfigType>(
    "businessposconfig",
    businessPosConfigSchema,
  );

export { BusinessPosConfig };
