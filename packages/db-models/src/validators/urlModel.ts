import { z } from 'zod';

export const UrlAttrs = z.object({
  longUrl: z.string(),
  shortUrl: z.string(),
  urlCode: z.string(),
});

export type UrlType = z.infer<typeof UrlAttrs>;
