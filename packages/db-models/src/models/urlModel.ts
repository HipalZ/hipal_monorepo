import mongoose, { type Model } from "mongoose";
import type { UrlModelType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const urlModelChema = new mongoose.Schema<UrlModelType>(
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
    },
  },
  {
    timestamps: true,
  },
);

const UrlModel: Model<UrlModelType> = mongoose.model<UrlModelType>(
  "urlModel",
  urlModelChema,
);

export { UrlModel };
