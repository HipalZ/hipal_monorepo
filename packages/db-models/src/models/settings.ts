import mongoose, { Model } from "mongoose";
import { SettingsType } from "../validators";

const settingsSchema = new mongoose.Schema<SettingsType>(
  {
    businessId: {
      required: true,
      type: String,
    },
    themes: {
      required: false,
      type: Object,
    },
    explore: {
      required: false,
      type: Object,
    },
    navigation: {
      required: false,
      type: Object,
    },
    categoryOrder: {
      required: false,
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Settings: Model<SettingsType> = mongoose.model<SettingsType>(
  "Settings",
  settingsSchema
);

export { Settings };
