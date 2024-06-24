/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable autofix/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
import { z } from 'zod';

const envSchema = z.object({
  MONGO_URI: z.string(),
  // JWT_SECRET: z.string(),
});

envSchema.parse(process.env);
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
