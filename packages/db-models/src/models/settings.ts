import mongoose, { Model } from "mongoose";
import { SettingsType, ThemesType } from "../validators";

const themesSchema = new mongoose.Schema<ThemesType>({
  primaryColor: { type: String },
  secondaryColor: { type: String },
  accentColor: { type: String },
  fontFamily: { type: String },
  fontURL: { type: String },
  buttonStyle: { type: String },
  miniBanner: { type: String },
  specialBanner: { type: String },
  endBanner: { type: String },
  instagramLink: { type: String },
  facebookLink: { type: String },
  youtubeLink: { type: String },
  linkedinLink: { type: String },
  footerText: { type: String },
});

const settingsSchema = new mongoose.Schema<SettingsType>(
  {
    businessId: {
      required: true,
      type: String,
    },
    themes: {
      required: false,
      type: themesSchema,
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
