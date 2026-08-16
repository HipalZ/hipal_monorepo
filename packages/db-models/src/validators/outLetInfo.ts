import { z } from "zod";
import { BusinessEnumType } from "./business";
import { ObjectIdSchema } from "./common";

export const Amenities = [
  "SMOKING SECTION",
  "BUFFET",
  "PARKING",
  "HI SPEED WIFI",
  "CHILD FRIENDLY",
  "ALCOHOL",
  "DELIVERY",
  "TAKEAWAY",
  "DINEIN",
  "RESERVATION",
] as const;

export const CurrencyCode = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CNY",
  "RUB",
  "BRL",
  "ZAR",
  "KRW",
  "MXN",
  "NZD",
  "SGD",
] as const;

export type CurrencyCodeEnumType = (typeof CurrencyCode)[number];

export const CurrencyCodeSymbol = [
  "₹", // Indian Rupee
  "$", // US Dollar
  "€", // Euro
  "£", // British Pound
  "¥", // Japanese Yen
  "A$", // Australian Dollar
  "C$", // Canadian Dollar
  "¥", // Chinese Yuan
  "₽", // Russian Ruble
  "R$", // Brazilian Real
  "R", // South African Rand
  "₩", // South Korean Won
  "$", // Mexican Peso
  "$", // New Zealand Dollar
  "$", // Singapore Dollar
] as const;

export type CurrencyCodeSymbolEnumType = (typeof CurrencyCodeSymbol)[number];

export const SocialMedia = z.object({
  icon: z.string().min(4).max(30),
  link: z.string().url().min(10).max(100),
});

export const outLetInfoSchema = z.object({
  name: z.string().min(4).max(50).optional(),
  businessId: ObjectIdSchema,
  fssai: z
    .string({ message: "add valid fssai number" })
    .min(14)
    .max(16)
    .optional(),
  gst: z.string({ message: "add valid gst number" }).min(15).max(16).optional(),
  specialBannerUrl: z
    .string()
    .url({ message: "add valid url" })
    .min(10)
    .max(100)
    .optional(),
  endBannerUrl: z
    .string()
    .url({ message: "add valid url" })
    .min(10)
    .max(100)
    .optional(),
  categoryTopBannerUrl: z
    .string()
    .url({ message: "add valid url" })
    .min(10)
    .max(100)
    .optional(),
  hotelBanners: z.array(z.string()).optional(),
  hoteBanners: z.array(z.string()).optional(),
  logoUrl: z
    .string()
    .url({ message: "add valid url" })
    .min(10)
    .max(100)
    .optional(),
  description: z.string().min(4).max(250).optional(),
  instruction: z.string().min(4).max(250).optional(),
  tags: z.array(z.string().min(3).max(30)).optional(),
  phone: z
    .string({ message: "enter valid 10 digit phone" })
    .min(10)
    .max(10)
    .optional(),
  location: z
    .string({ message: "valid url address" })
    .url()
    .min(10)
    .max(100)
    .optional(),
  amenities: z.enum(Amenities).array().optional(),
  customTiming: z
    .array(
      z.object({
        day: z.string(),
        openTime: z.string(),
        closeTime: z.string(),
      }),
    )
    .optional(),
  address: z.string().min(4).max(100).optional(),
  startBillTime: z.coerce.number().optional().default(0),
  endBillTime: z.coerce.number().optional().default(1440),
  extendBillTime: z.coerce.number().optional().default(0),
  footerDescription: z.string().min(10).max(200).optional(),
  socialMediaLinks: z.array(SocialMedia).optional(),

  brandName: z.string().min(4).max(30).optional(),
  branchName: z.string().min(4).max(30).optional(),
  isCustomTime: z.boolean().optional(),
  avgPricingForTwo: z.coerce.number().positive().optional(),
  avgRating: z.coerce.number().positive().optional(),
  placeId: z.string().min(1).max(100).optional(),
  placeUrl: z.string().url().min(10).max(100).optional(),
  specialDay: z.number().optional(),
  serviceChargePercentage: z.coerce.number().default(0).optional(),
  gstPercentage: z.coerce.number().default(5).optional(),
  outLetType: z.enum(BusinessEnumType).optional(),
  hideDishPrice: z.boolean().optional(),
  isPosEnabled: z.boolean().default(false).optional(),
  restId: z.string().min(3).max(200).optional(),
  posBusinessConfigId: ObjectIdSchema.optional(),
  companyRegistration: z.string().min(3).max(100).url().optional(),
  bankAccount: z.string().min(3).max(100).url().optional(),
  aadharCard: z.string().min(3).max(100).url().optional(),
  panCard: z.string().min(3).max(100).url().optional(),
  serviceStatus: z
    .object({
      whatsapp: z.boolean().optional().default(false),
      payment_gateway: z.boolean().optional().default(false),
      google_my_business: z.boolean().optional().default(false),
      make_my_trip: z.boolean().optional().default(false),
      trip_advisor: z.boolean().optional().default(false),
    })
    .optional(),
  helpPhoneNumber: z.string().min(10).max(10).optional(),
  newAmenities: z.array(ObjectIdSchema).optional(),
  birthdayCampaign: ObjectIdSchema.optional(),
  registeredName: z.string().min(3).max(100).optional(),
  menuId: ObjectIdSchema.optional(),
  veg: z.boolean().optional().default(true),
  nonVeg: z.boolean().optional().default(true),
  egg: z.boolean().optional().default(true),
  vegan: z.boolean().optional().default(true),
  alcohol: z.boolean().optional().default(true),
  nonAlcohol: z.boolean().optional().default(true),
  addButton: z.boolean().optional().default(true),
  placeOrderButton: z.boolean().optional().default(true),
  orderEditWindowMinutes: z.coerce.number().min(0).max(120).optional().default(2),
  currencyCode: z.enum(CurrencyCode).optional(),
  currencySymbol: z.enum(CurrencyCodeSymbol).optional(),
  shareCart: z.boolean().optional().default(false),
  isPosSynced: z.boolean().optional().default(false),
  posProgress: z.number().optional().default(0),
  isHipalzPos: z.boolean().optional().default(false),
  web3Ledger: z.boolean().optional().default(false),
});

export type OutLetInfoType = z.infer<typeof outLetInfoSchema>;
