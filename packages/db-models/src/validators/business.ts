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
  name: z.string().max(50),
  registeredName: z.string().max(50).optional(),
  //TODO : MEANINGFULL KEY NAME
  businessType: z.enum(['FOOD', 'OTHER']),
  multipleOutlets: z.array(ObjectIdSchema).optional(),
  //TODO:
  customLink: z.string().max(30),
  staffIds: z.array(ObjectIdSchema),
  gst: z.string().max(26).optional(),
  fssai: z.string().max(26).optional(),
  //TODO : ISACTIVE
  isActive: z.boolean().optional().default(false),
  //TODO : CREATE NEW LIASENCE
  // withPopCorn: z.boolean().default(false).optional(),
  // cloneParentBusinessData: z.boolean().default(false).optional(),
  exploreLayout: z.enum(ExploreLayout).optional(),
  //TODO : EXPORT FROM HERE
  menuLayout: z.enum(MenuLayout).optional(),
  primaryColor: z.string().max(30).optional(),
  secondaryColor: z.string().max(30).optional(),
});

export type BusinessType = z.infer<typeof BusinessSchema>;
