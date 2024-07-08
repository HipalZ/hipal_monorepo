import { z } from 'zod';

export const ownerLoginValidator = z.object({
  name: z.string().max(255),
  phone: z.string().max(10),
  otp: z.string().length(4).optional(),
  password: z.string().max(20).optional(),
});

export type ownerLoginValidatorType = z.infer<typeof ownerLoginValidator>;
