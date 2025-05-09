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
  startTime: z.coerce.number().optional().default(0),
  endTime: z.coerce.number().optional().default(24),
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
});

export type OutLetInfoType = z.infer<typeof outLetInfoSchema>;
