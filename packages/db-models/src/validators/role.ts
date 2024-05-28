import { z } from 'zod';

export const RoleSchema = z.object({
  name: z.string(),
  description: z.string(),
  permissions: z.array(z.string()),
  businessId: z.string(),
});

export type Role = z.infer<typeof RoleSchema>;