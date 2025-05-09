import { z } from "zod";
import { ObjectIdSchema } from "./common";

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
