import mongoose, { Model } from "mongoose";
import {
  ThemesType,
  SpecialOfferType,
  HighlightType,
  ExploreType,
  NavigationType,
  SettingsType,
} from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId as any;

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

const specialOfferSchema = new mongoose.Schema<SpecialOfferType>({
  wallpaper: { type: String },
  offerName: { type: String },
  redirectType: { type: String },
  redirectId: { type: String },
  redirectName: { type: String },
});

const highlightSchema = new mongoose.Schema<HighlightType>({
  name: { type: String },
  stories: { type: [String] },
});

const exploreSchema = new mongoose.Schema<ExploreType>({
  wallpaper: { type: String },
  phone: { type: String },
  countryCode: { type: String },
  location: { type: String },
  openFrom: { type: String },
  openTill: { type: String },
  specialOffers: { type: [specialOfferSchema] },
  popular: { type: [ObjectId], ref: "dish" },
  highlights: { type: [highlightSchema] },
});

const navigationSchema = new mongoose.Schema<NavigationType>({
  from: { type: String },
  to: { type: String },
  categoryCard: { type: String },
  dishCard: { type: String },
});

const settingsSchema = new mongoose.Schema<SettingsType>(
  {
    businessId: {
      required: true,
      type: ObjectId,
      ref: "Business",
    },
    themes: {
      required: false,
      type: themesSchema,
    },
    explore: {
      required: false,
      type: exploreSchema,
    },
    navigation: {
      required: false,
      type: navigationSchema,
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
