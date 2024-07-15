import mongoose from 'mongoose';
import { string, z } from 'zod';

const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: 'Invalid ObjectId',
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const subPermissions = z.object({
  title: z.string().optional(),
  permissions: z.array(string()),
});

export const CustomRole = z.object({
  businessId: ObjectIdSchema,
  role: z.string(),
  permissions: z.array(subPermissions).optional(),
  bookMark: z.boolean().optional(),
});

export const UserAttrs = z.object({
  id: z.string().optional(),
  name: z.string().min(3).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(10),
  role: z.array(z.string()).optional(),
  customRole: z.array(CustomRole).optional(),
  password: z.string().optional(),
  businessId: ObjectIdSchema.optional(),
  otp: z.string().optional(),
  loyaltyId: z.string().optional(),
  signUpBonus: z.number().optional(),
  userId: z.string().optional(),
  isDeleted: z.boolean().optional(),
  _id: z.string().optional(),
});

export type UserType = z.infer<typeof UserAttrs>;
export type CustomRoleType = z.infer<typeof CustomRole>;
