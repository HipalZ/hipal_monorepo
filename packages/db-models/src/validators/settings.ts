import { z } from 'zod';

export const Themes = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.string().optional(),
  fontURL: z.string().optional(),
  buttonStyle: z.string().optional(),
  miniBanner: z.string().optional(),
  specialBanner: z.string().optional(),
  endBanner: z.string().optional(),
  instagramLink: z.string().optional(),
  facebookLink: z.string().optional(),
  youtubeLink: z.string().optional(),
  linkedinLink: z.string().optional(),
  footerText: z.string().optional(),
});

export const specialOffer = z.object({
  wallpaper: z.string(),
  offerName: z.string(),
  redirectType: z.string(),
  redirectId: z.string(),
  redirectName: z.string(),
});

export const Highlight = z.object({
  name: z.string(),
  stories: z.array(z.string()),
});

export const Explore = z.object({
  wallpaper: z.string().optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  location: z.string().optional(),
  openFrom: z.string().optional(),
  openTill: z.string().optional(),
  specialOffers: z.array(specialOffer).optional(),
  popular: z.array(z.string()).optional(),
  highlights: z.array(Highlight).optional(),
});

export const Navigation = z.object({
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
export type ThemesType = z.infer<typeof Themes>;
export type ExploreType = z.infer<typeof Explore>;
export type NavigationType = z.infer<typeof Navigation>;
export type HighlightType = z.infer<typeof Highlight>;
export type SpecialOfferType = z.infer<typeof specialOffer>;
