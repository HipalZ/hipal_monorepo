import { z } from 'zod';

const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



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
  CO_OWNER: z.array(roleSchema).optional(),
  MANAGER: z.array(roleSchema).optional(),
  CAPTAIN: z.array(roleSchema).optional(),
  MARKETING_AGENT: z.array(roleSchema).optional(),
});

export type PermissionType = z.infer<typeof permissionsSchema>;
