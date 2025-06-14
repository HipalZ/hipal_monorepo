import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { BusinessPosConfigType } from "../validators";
import {
  OrderModeEnum,
  OrderVerificationTypeEnum,
} from "../validators/businessPosConfig";

const ObjectId = mongoose.Schema.Types.ObjectId;
const businessPosConfigSchema = new mongoose.Schema<BusinessPosConfigType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
      unique: true,
    },

    orderMode: {
      type: String,
      required: true,
      enum: OrderModeEnum,
    },
    orderVerificationType: {
      type: String,
      required: false,
      enum: OrderVerificationTypeEnum,
    },

    restName: {
      type: String,
      required: true,
    },
    date: {
      type: Number,
      required: true,
    },
    branchId: {
      type: String,
      required: true,
    },

    accessKey: {
      type: String,
      required: true,
    },

    secretKey: {
      type: String,
      required: true,
    },

    restId: {
      type: String,
      required: true,
    },

    authToken: {
      type: String,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    posName: {
      type: String,
      required: true,
      default: "PETPOOJA",
    },
    posId: {
      type: String,
      required: false,
    },
    defaultTableName: {
      type: String,
      required: false,
    },
    active: {
      type: Boolean,
      required: false,
      default: true,
    },
    onlyMenu: {
      type: Boolean,
      required: false,
      default: false,
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
