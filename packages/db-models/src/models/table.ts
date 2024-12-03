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
    },
    zoneId: {
      type: String,
      required: true,
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
      type: String,
      required: false,
    },

    rank: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

tableSchema.index({ businessId: 1, name: 1, tableId: 1 }, { unique: true });

const Table: Model<TableType> = mongoose.model<TableType>("table", tableSchema);

export { Table };
