import mongoose, { type Model } from "mongoose";
import type { UnsettleTableType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const unsettledTableSchema = new mongoose.Schema<UnsettleTableType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
    },
    date: {
      type: Number,
      required: true,
    },
    tableName: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    sync: {
      type: Boolean,
      required: true,
    },
    requestId: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
      required: true,
    },
    restId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const UnsettleTable: Model<UnsettleTableType> =
  mongoose.model<UnsettleTableType>("unsettletable", unsettledTableSchema);

export { UnsettleTable };
