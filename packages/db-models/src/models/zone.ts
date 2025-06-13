import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { ZoneType } from "../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

const zoneSchema = new mongoose.Schema<ZoneType>(
  {
    name: {
      type: String,
      required: true,
    },
    businessId: {
      type: ObjectId,
      required: true,
    },
    staffIds: {
      type: [ObjectId],
      required: false,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    zoneId: {
      type: String,
      required: false,
    },
    active: {
      type: Boolean,
      required: false,
      default: true,
    },
    rank: {
      type: String,
      required: false,
    },
    couponIds: {
      type: [ObjectId],
      required: false,
      ref: "COUPONZ",
    },
    taxes: {
      type: Number,
      required: false,
    },
    visibility: {
      type: Boolean,
      required: false,
      default: true,
    },
    tableIds: {
      type: [ObjectId],
      required: false,
      ref: "table",
    },
  },
  {
    timestamps: true,
  },
);

zoneSchema.index({ businessId: 1, name: 1, zoneId: 1 }, { unique: true });
zoneSchema.index({ businessId: 1, name: 1 }, { unique: true });

const Zone: Model<ZoneType> = mongoose.model<ZoneType>("zone", zoneSchema);

export { Zone };
