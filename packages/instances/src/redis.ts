import { Redis } from '@upstash/redis';

export const redisClient = new Redis({
  url: Bun.env.REDIS_URL,
  token: Bun.env.REDIS_PASSWORD,
});
