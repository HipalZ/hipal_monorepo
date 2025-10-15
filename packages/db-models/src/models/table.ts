import mongoose, { type Model } from "mongoose";
import type { TableType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const tableSchema = new mongoose.Schema<TableType>(
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
    zoneId: {
      type: String,
      required: false,
    },
    staffIds: {
      type: [ObjectId],
      required: false,
      ref: "User",
    },
    capacity: {
      type: Number,
      required: false,
    },
    displayForCaptains: {
      type: Boolean,
      required: false,
      default: true,
    },
    hiCode: {
      type: String,
      required: false,
    },

    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    tableId: {
      type: String,
      required: false,
    },
    active: {
      type: Boolean,
      required: false,
      default: true,
    },
    currentTableAmount: {
      type: Number,
      required: false,
      default: 0,
    },

    rank: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EMPTY", "BILL"],
      default: "EMPTY",
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
    date: {
      type: Number,
      required: false,
    },
    isTransfer: {
      type: Boolean,
      required: false,
      default: false,
    },
    edited: {
      type: Boolean,
      required: false,
      default: false,
    },
    editedBy: {
      type: ObjectId,
      required: false,
      ref: "User",
    },
    internalZoneId: {
      type: ObjectId,
      required: false,
      ref: "zone",
    },
    visibility: {
      type: Boolean,
      required: false,
      default: true,
    },
    tableLink: {
      type: String,
      required: false,
    },
    pos: {
      type: Boolean,
      required: false,
      default: false,
    },
    isMerge: {
      type: Boolean,
      required: false,
      default: false,
    },
    mergeTableIds: {
      type: [ObjectId],
      required: false,
      default: [],
      ref: "table",
    },
    mergeBy: {
      type: ObjectId,
      required: false,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

tableSchema.index({ businessId: 1, name: 1, tableId: 1 }, { unique: true });
tableSchema.index({ businessId: 1, name: 1 }, { unique: true });

const Table: Model<TableType> = mongoose.model<TableType>("table", tableSchema);

export { Table };
