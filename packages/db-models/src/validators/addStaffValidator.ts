import { z } from "zod";

export const addStaffValidator = z
  .object({
    businessId: z.string(),
    name: z.string().min(2).max(30),
    phone: z.string().min(10).max(10),
    role: z.enum([
      "HIPAL_ADMIN",
      "HIPAL_CUSTOMER",
      "OWNER",
      "CO_OWNER",
      "MANAGER",
      "CAPTAIN",
      "MARKETING_AGENT",
    ]),
    permissionIds: z.array(z.string()).optional().default([]),
    permissionGroupIds: z.array(z.string()).optional().default([]),
    password: z.string().min(4).max(15),
  })
  .refine(
    (data) => {
      return (
        data.permissionIds?.length > 0 || data.permissionGroupIds?.length > 0
      );
    },
    {
      message: "Either permissionIds or permissionGroupIds must be provided",
      path: ["permissionIds", "permissionGroupIds"], // specify the path to the fields that caused the error
    },
  );

export type AddStaffValidatorType = z.infer<typeof addStaffValidator>;
