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

    date: {
      type: Number,
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
    printKot: {
      type: Boolean,
      required: false,
      default: true,
    },
    repeatPrint: {
      type: Number,
      required: false,
      default: 1,
    },
    posRestName: {
      type: String,
      required: false,
      default: "pos",
    },
    restName: {
      type: String,
      required: false,
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
