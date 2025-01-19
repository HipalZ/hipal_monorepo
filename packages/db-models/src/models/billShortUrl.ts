import mongoose, { type Model } from "mongoose";
import type { BillUrlModelType } from "../validators";

const billUrlModelChema = new mongoose.Schema<BillUrlModelType>(
  {
    longUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
    },
    urlCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const BillUrlModel: Model<BillUrlModelType> = mongoose.model<BillUrlModelType>(
  "billurlmodel",
  billUrlModelChema,
);

export { BillUrlModel };
