import mongoose, { type Model } from "mongoose";
import type { PosType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const posSchema = new mongoose.Schema<PosType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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
    businessId: {
      type: ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Pos: Model<PosType> = mongoose.model<PosType>("pos", posSchema);

export { Pos };
