import mongoose from 'mongoose';
import { z } from 'zod';
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: 'Invalid ObjectId',
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const BannerTypes = ['BANNER_TYPE_1', 'BANNER_TYPE_2', 'BANNER_TYPE_3'] as const;
export const FontWeight = ['400', '500', '600', '700', '800', '900', '1000'] as const;

export const Alignment = ['LEFT', 'CENTER', 'RIGHT', 'JUSTIFY'] as const;
export const RedirectionType = ['CATEGORY', 'DISH', 'LINK', 'NONE'] as const;

export const bannerSchema = z.object({
  businessId: ObjectIdSchema,
  bannerType: z.enum(BannerTypes).optional(),
  bannerImage: z.string().min(3).max(100).url().optional(),
  headingColor: z.string().min(3).max(100).optional(),
  headingFontWeight: z.enum(FontWeight).optional(),
  headingAlign: z.enum(Alignment).optional(),
  paragraphColor: z.string().min(3).max(100).optional(),
  paragraphFontWeight: z.enum(FontWeight).optional(),
  paragraphAlign: z.enum(Alignment).optional(),
  buttonColor: z.string().min(3).max(100).optional(),
  callToAction: z.string().min(3).max(100).optional(),
  backgroundColor: z.string().min(3).max(100).optional(),
  redirectionId: z.string().optional().optional(),
  redirectionType: z.enum(RedirectionType).optional(),

  isDeleted: z.boolean().default(false).optional(),
});

export type BannerType = z.infer<typeof bannerSchema>;
