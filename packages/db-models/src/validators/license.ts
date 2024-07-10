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
export const licenseSchema = z.object({
  businessId: ObjectIdSchema,
  withPopcorn: z.boolean().default(false),
});

export type LicenseType = z.infer<typeof licenseSchema>;
