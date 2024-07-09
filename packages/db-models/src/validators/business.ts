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
export const BusinessSchema = z.object({
  businessName: z.string().max(50),
  registeredName: z.string().max(50).optional(),
  businessType: z.enum(['FOOD', 'OTHER']),
  gstRegistered: z.boolean().default(false).optional(),
  multipleOutlets: z.boolean().default(false).optional(),
  parent_business_id: ObjectIdSchema.optional(),
  customLink: z.string().max(30),
  staffIds: z.array(ObjectIdSchema),
  gstNumber: z.string().optional(),
  fssaiLicenseNumber: z.string().optional(),
  status: z.boolean().optional(),
  withPopCorn: z.boolean().default(false).optional(),
  cloneParentBusinessData: z.boolean().default(false).optional(),
  exploreLayout: z.enum(['BUTTER', 'SUNFLOWER']).optional(),
  menuLayout: z.enum(['MAIN_CATEGORY', 'MAIN_AND_SUB_CATEGORY']).optional(),
  primaryColor: z.string().max(30).optional(),
  secondaryColor: z.string().max(30).optional(),
});

export type BusinessType = z.infer<typeof BusinessSchema>;
