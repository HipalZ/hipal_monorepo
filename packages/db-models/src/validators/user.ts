import { z } from 'zod';
import { ObjectIdSchema } from './common';

export const CustomRole = z.object({
  businessId: ObjectIdSchema,
  role: z.string(),
  permissions: z.object({}).optional(),
  permissionIds: z.array(ObjectIdSchema).optional(),
  permissionGroupIds: z.array(ObjectIdSchema).optional(),
  bookMark: z.boolean().optional(),
  isDeleted: z.boolean().optional().default(false),
  nickName: z.string().optional(),
  serviceIds: z.array(ObjectIdSchema).optional(),
  restaurantIds: z.array(ObjectIdSchema).optional(),
});

export const UserAttrs = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(10),
  dob: z.number().optional(),
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
  birthdayTriggerCount: z.number().optional(),
  address: z.string().min(5).max(200).optional(),
  profession: z.string().min(2).max(100).optional(),
});

export type UserType = z.infer<typeof UserAttrs>;
export type CustomRoleType = z.infer<typeof CustomRole>;
