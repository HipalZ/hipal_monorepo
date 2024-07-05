import mongoose from 'mongoose';
import { string, z } from 'zod';
import Otp from '../../../../clients/client-hibiz-react/src/components/templates/signupPage/otp';

const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: 'Invalid ObjectId',
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);
export const UserController = z
  .object({
    hibiz: z.boolean().optional(),
    dish: z.boolean().optional(),
    staff: z.boolean().optional(),
    loyalty: z.boolean().optional(),
    sale: z.boolean().optional(),
    reports: z.boolean().optional(),
    zones_table: z.boolean().optional(),
  })
  .default({})
  .optional();
export const CustomRole = z.object({
  businessId: ObjectIdSchema,
  customRoleId: ObjectIdSchema,
  roleName: z.string().optional(),
  role: z.string().optional(),
  accessControl: UserController,
  bookMark: z.boolean().optional(),
});

export const UserAttrs = z.object({
  id: z.string().optional(),
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(10),
  role: z.string().optional(),
  customRole: z.array(CustomRole).optional(),
  password: z.string().optional(),
  businessId: ObjectIdSchema.optional(),
  otp: z.string().optional(),
  loyaltyId: z.string().optional(),
  signUpBonus: z.number().optional(),
  userId: z.string().optional(),

  _id: z.string().optional(),
});

export type UserType = z.infer<typeof UserAttrs>;
export type CustomRoleType = z.infer<typeof CustomRole>;
export type UserControllerType = z.infer<typeof UserController>;
