import { z } from 'zod';

const CustomRole = z.object({
  businessId: z.string(),
  customRoleId: z.string(),
});

const AdminAttrs = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  customRole: z.array(CustomRole).optional(),
  password: z.string().optional(),
});

export type AdminType = z.infer<typeof AdminAttrs>;
