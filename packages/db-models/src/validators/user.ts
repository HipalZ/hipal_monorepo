import { z } from "zod";

const CustomRole = z.object({
  businessId: z.string(),
  customRoleId: z.string(),
  roleName: z.string(),
});

const UserController = z
  .object({
    hibiz: z.boolean().optional(),
    dish: z.boolean().optional(),
    staff: z.boolean().optional(),
    loyalty: z.boolean().optional(),
    sale: z.boolean().optional(),
    reports: z.boolean().optional(),
    zones_table: z.boolean().optional(),
  })
  .default({});

const UserAttrs = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  phone: z.string(),
  DOB: z.string().optional(),
  userDiscription: z.string().optional(),
  gender: z.string().optional(),
  customRole: z.array(CustomRole).optional(),
  password: z.string().optional(),
  accessControl: UserController,
  withScaner: z.boolean().default(false),
});

export type UserType = z.infer<typeof UserAttrs>;
export type CustomRoleType = z.infer<typeof CustomRole>;
export type UserControllerType = z.infer<typeof UserController>;
