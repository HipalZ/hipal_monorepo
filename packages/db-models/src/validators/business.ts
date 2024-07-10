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

export const ExploreLayout = ['BUTTER', 'SUNFLOWER'] as const;
export const MenuLayout = ['MAIN_CATEGORY', 'MAIN_AND_SUB_CATEGORY'] as const;
export const BusinessSchema = z.object({
  name: z.string().min(4).max(50),
  businessType: z.enum(['FOOD', 'OTHER']),
  multipleOutlets: z.array(ObjectIdSchema).optional(),
  customLink: z.string().min(3).max(30),
  staffIds: z.array(ObjectIdSchema),
  isActive: z.boolean().optional().default(false),
  //TODO : CREATE NEW LIASENCE
  exploreLayout: z.enum(ExploreLayout).optional(),
  menuLayout: z.enum(MenuLayout).optional(),
  primaryColor: z.string().min(5).max(30).optional(),
  secondaryColor: z.string().min(4).max(30).optional(),
});

export const UpdateBusinessSchema = z.object({
  name: z.string().min(4).max(50).optional(),

  businessType: z.enum(['FOOD', 'OTHER']),
  exploreLayout: z.enum(ExploreLayout).optional(),
  menuLayout: z.enum(MenuLayout).optional(),
  primaryColor: z.string().min(5).max(30).optional(),
  secondaryColor: z.string().min(5).max(30).optional(),
});
export type BusinessType = z.infer<typeof BusinessSchema>;
