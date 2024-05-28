import mongoose from "mongoose";
import { ClientRoles } from '@hipal/common';

interface Themes {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontURL: string;
  buttonStyle: string;
  miniBanner: string;
  specialBanner: string;
  endBanner: string;
  instagramLink: string;
  facebookLink: string;
  youtubeLink: string;
  linkedinLink: string;
  footerText: string;
};

interface specialOffer {
  wallpaper: string;
  offerName: string;
  redirectType: string;
  redirectId: string;
  redirectName: string;
}

interface Dish {
  id: string;
  name: string;
}

interface Highlight {
  name: string;
  stories: string[];
}

interface Explore {
  wallpaper: string;
  phone: string;
  countryCode: string;
  location: string;
  openFrom: string;
  openTill: string;
  specialOffers: specialOffer[];
  popular: Dish[];
  highlights: Highlight[];
};

interface Navigation {
  from: string;
  to: string;
  categoryCard: string;
  dishCard: string;
};

interface SettingsAttrs {
  businessId: string;
  themes: Themes,
  explore: Explore,
  navigation: Navigation,
  categoryOrder: string[];
};

interface SettingsModel extends mongoose.Model<SettingsDoc> {
  build(attrs: SettingsAttrs): SettingsDoc;
};

interface SettingsDoc extends mongoose.Document {
  businessId: string;
  themes: Themes,
  explore: Explore,
  navigation: Navigation,
  categoryOrder: string[];
};

const settingsSchema = new mongoose.Schema({
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
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
});

settingsSchema.statics.build = (attrs: SettingsAttrs) => {
  return new Settings(attrs);
};

const Settings = mongoose.model<SettingsDoc, SettingsModel, {}>('Settings', settingsSchema);

export { Settings };
