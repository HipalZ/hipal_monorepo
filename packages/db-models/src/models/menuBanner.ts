import mongoose, { type Model } from "mongoose";
import type { MenuBannerType } from "../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

const menuBannerSchema = new mongoose.Schema<MenuBannerType>(
  {
    businessId: {
      type: ObjectId,
      ref: "Business",
      required: true,
    },
    startTime: {
      type: Number,
      required: true,
      default: 0,
    },
    endTime: {
      type: Number,
      required: true,
      default: 86400000,
    },
    isPublished: {
      type: Boolean,
      required: false,
      default: true,
    },
    heading: {
      type: String,
      required: true,
    },
    dishIds: {
      type: [ObjectId],
      ref: "Dish",
      required: true,
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

const MenuBanner: Model<MenuBannerType> = mongoose.model<MenuBannerType>(
  "MenuBanner",
  menuBannerSchema,
);

export { MenuBanner };
