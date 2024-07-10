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

export const subPermissionSchema = z.object({
  subTitle: z.string(),
  descriptions: z.string(),
});

export const roleSchema = z.object({
  title: z.string(),
  subPermissions: z.array(subPermissionSchema),
});

export const permissionsSchema = z.object({
  businessId: ObjectIdSchema,
  co_owner: z.array(roleSchema).optional(),
  manager: z.array(roleSchema).optional(),
  captain: z.array(roleSchema).optional(),
  marketingAgent: z.array(roleSchema).optional(),
});

export type PermissionType = z.infer<typeof permissionsSchema>;
