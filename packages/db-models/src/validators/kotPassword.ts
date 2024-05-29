import { z } from 'zod';

const KotPasswordAttrs = z.object({
  businessId: z.string(),
  password: z.number(),
});

export type KotPasswordType = z.infer<typeof KotPasswordAttrs>;