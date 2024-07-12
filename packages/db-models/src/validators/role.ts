import { z } from 'zod';

export const RoleSchema = z.object({
  name: z.enum(['MANAGER','CO_OWNER',"CAPTAIN", "MARKETING_AGENT", 'RESTAURANT_OWNER']),
  description: z.string().max(100).optional(),
  permissions: z.array(z.string()).max(100).optional(),
  businessId: z.string(),
});

export type BusinessRoleType = z.infer<typeof RoleSchema>;
