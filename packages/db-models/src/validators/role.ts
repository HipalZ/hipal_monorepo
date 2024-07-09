import { z } from 'zod';

export const RoleSchema = z.object({
  name: z.enum(['RESTAURANT_MANAGER', 'RESTAURANT_FLOOR_MANAGER', 'RESTAURANT_STAFF', 'OPERATOR']),
  description: z.string().max(100).optional(),
  permissions: z.array(z.string()).max(100).optional(),
  businessId: z.string(),
});

export type BusinessRoleType = z.infer<typeof RoleSchema>;
