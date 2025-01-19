import { z } from "zod";

export const addStaffValidator = z.object({
  businessId: z.string(),
  name: z.string().min(3).max(30),
  phone: z.string().min(10).max(10),
  // permissions: z
  //   .array(
  //     z.object({
  //       title: z.string(),
  //       subPermissions: z.array(string()).optional(),
  //     }),
  //   )
  //   .optional(),
  role: z.enum([
    "HIPAL_ADMIN",
    "HIPAL_CUSTOMER",
    "OWNER",
    "CO_OWNER",
    "MANAGER",
    "CAPTAIN",
    "MARKETING_AGENT",
  ]),
});

export type AddStaffValidatorType = z.infer<typeof addStaffValidator>;
