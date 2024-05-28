
import { z } from "zod";

const Themes = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.string(),
  fontURL: z.string(),
  buttonStyle: z.string(),
  miniBanner: z.string(),
  specialBanner: z.string(),
  endBanner: z.string(),
  instagramLink: z.string(),
  facebookLink: z.string(),
  youtubeLink: z.string(),
  linkedinLink: z.string(),
  footerText: z.string(),
});

const specialOffer = z.object({
  wallpaper: z.string(),
  offerName: z.string(),
  redirectType: z.string(),
  redirectId: z.string(),
  redirectName: z.string(),
});

const Dish = z.object({
  id: z.string(),
  name: z.string(),
});

const Highlight = z.object({
  name: z.string(),
  stories: z.array(z.string()),
});

const Explore = z.object({
  wallpaper: z.string(),
  phone: z.string(),
  countryCode: z.string(),
  location: z.string(),
  openFrom: z.string(),
  openTill: z.string(),
  specialOffers: z.array(specialOffer),
  popular: z.array(Dish),
  highlights: z.array(Highlight),
});

const Navigation = z.object({
  from: z.string(),
  to: z.string(),
  categoryCard: z.string(),
  dishCard: z.string(),
});

export const settingsSchema = z.object({
  businessId: z.string(),
  themes: Themes.optional(),
  explore: Explore.optional(),
  navigation: Navigation.optional(),
  categoryOrder: z.array(z.string()).optional(),
});

export type SettingsType = z.infer<typeof settingsSchema>;