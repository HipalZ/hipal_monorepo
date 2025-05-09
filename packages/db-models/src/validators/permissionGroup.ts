import { z } from "zod";

export const permissionGroupSchema = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(1, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    }),

  permissions: z.object({}),
});

export type PermissionGroupType = z.infer<typeof permissionGroupSchema>;
