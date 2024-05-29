import mongoose, { Model } from "mongoose";

import { UrlType } from "../validators";

const urlSchema = new mongoose.Schema<UrlType>(
  {
    longUrl: {
      type: String,
    },
    shortUrl: {
      type: String,
    },
    urlCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UrlModel: Model<UrlType> = mongoose.model<UrlType>("UrlModel", urlSchema);

export { UrlModel };
