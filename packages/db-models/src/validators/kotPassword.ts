import { z } from 'zod';

const KotPasswordAttrs = z.object({
  businessId: z.string(),
  password: z.coerce.number(),
});

export type KotPasswordType = z.infer<typeof KotPasswordAttrs>;
