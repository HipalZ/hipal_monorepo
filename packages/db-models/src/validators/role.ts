import { z } from "zod";

const RoleSchema = z.object({
  name: z.string(),
  description: z.string(),
  permissions: z.array(z.string()),
  businessId: z.string(),
});

export type BusinessRoleType = z.infer<typeof RoleSchema>;
