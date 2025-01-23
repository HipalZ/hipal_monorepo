import mongoose, { type Model } from "mongoose";
import type { UnsettleTableType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const unsettledTableSchema = new mongoose.Schema<UnsettleTableType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
    },
    capacity: {
      type: Number,
      required: false,
    },
    tableId: {
      type: ObjectId,
      required: true,
      ref: "table",
    },
    kotIds: {
      type: [ObjectId],
      required: false,
      default: [],
      ref: "kotorder",
    },
    status: {
      type: String,
      required: false,
      default: "ACTIVE",
    },
    totalItemCount: {
      type: Number,
      required: false,
      default: 0,
    },
    userIds: {
      type: [ObjectId],
      required: false,
      default: [],
      ref: "User",
    },
    currentTableAmount: {
      type: Number,
      required: false,
      default: 0,
    },
    date: {
      type: Number,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    performedBy: {
      type: ObjectId,
      required: false,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const UnsettleTable: Model<UnsettleTableType> =
  mongoose.model<UnsettleTableType>("unsettletable", unsettledTableSchema);

export { UnsettleTable };
