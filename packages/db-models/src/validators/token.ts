import { z } from 'zod';

export const TokenValidator = z.object({
  x_access_token: z.string(),
  x_refresh_token: z.string(),
});

export type Token = z.infer<typeof TokenValidator>;
