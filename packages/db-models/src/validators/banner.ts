import mongoose from "mongoose";
import { z } from "zod";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

// export const LayOutTypeEnum = [
//   "FIT_WITH_LINK",
//   "FIT_WITH_NO_LINK",
//   "HANGING_CARD_WITH_LINK",
//   "HANGING_CARD_WITH_NO_LINK",
//   "EXPAND_WITH_LINK",
//   "EXPAND_WITH_NO_LINK",
//   "EXPAND_CENTER_WITH_LINK",
//   "EXPAND_CENTER_WITH_NO_LINK",
//   "EXPAND_TOP_WITH_LINK",
//   "EXPAND_TOP_WITH_NO_LINK",
//   "COOL_TEXT_WITH_LINK",
//   "COOL_TEXT_WITH_NO_LINK",
// ] as const;
export const LayOutTypeEnum = [
  "BANNER_TYPE_1",
  "BANNER_TYPE_2",
  "BANNER_TYPE_3",
  "BANNER_TYPE_4",
  "BANNER_TYPE_5",
  "BANNER_TYPE_6",
  "BANNER_TYPE_7",
  "BANNER_TYPE_8",
  "BANNER_TYPE_9",
  "BANNER_TYPE_10",
  "BANNER_TYPE_11",
  "BANNER_TYPE_12",
  "BANNER_TYPE_13",
] as const;

export const FontWeight = [
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "1000",
] as const;

export const Alignment = ["LEFT", "CENTER", "RIGHT", "JUSTIFY"] as const;
export const RedirectionType = ["CATEGORY", "DISH", "LINK", "NONE"] as const;

export const bannerSchema = z.object({
  _id: ObjectIdSchema.optional(),
  businessId: ObjectIdSchema,
  layout: z.enum(LayOutTypeEnum, {
    message: "Invalid layout type",
  }),

  bannerImage: z
    .string()
    .min(3, {
      message: "Invalid banner image",
    })
    .max(100)
    .url()
    .optional(),
  heading: z.string().min(3).max(20).optional(),
  headingColor: z.string().min(3).max(100).optional(),
  headingFontWeight: z.enum(FontWeight).optional(),
  headingAlign: z.enum(Alignment).optional(),
  paragraph: z.string().min(3).max(100).optional(),
  paragraphColor: z.string().min(3).max(100).optional(),
  paragraphFontWeight: z.enum(FontWeight).optional(),
  paragraphAlign: z.enum(Alignment).optional(),
  buttonName: z.string().min(3).max(100).optional(),
  buttonColor: z.string().min(3).max(100).optional(),
  buttonTextColor: z.string().min(3).max(100).optional(),
  callToAction: z.string().min(3).max(100).optional(),
  backgroundColor: z.string().min(3).max(100).optional(),
  redirectionId: z.string().optional().optional(),
  redirectionType: z.enum(RedirectionType).optional(),
  isPublished: z.boolean().default(false).optional(),
  patternType: z.string().optional(),
  redirectionName: z.string().optional(),
  isDeleted: z.boolean().default(false).optional(),
  sequence: z.number().optional(),
});

export type BannerType = z.infer<typeof bannerSchema>;
