import mongoose, { type Model } from "mongoose";
import type { PosType } from "../validators";

const posSchema = new mongoose.Schema<PosType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Pos: Model<PosType> = mongoose.model<PosType>("pos", posSchema);

export { Pos };
