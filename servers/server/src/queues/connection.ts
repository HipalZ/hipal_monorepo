import IORedis from 'ioredis';

const TEST_REDIS_URL = 'redis://default:xw0DmhgNWWgcdmWagMBKVxR2THdot0JR@redis-10636.crce281.ap-south-1-3.ec2.cloud.redislabs.com:10636';

const redisUrl =
  process.env.NODE_ENV === 'test'
    ? TEST_REDIS_URL
    : process.env.REDIS_URL || 'redis://default:E2nClmldtgDUialnGhDoiAsmJ14dyIPD@redis-15262.crce182.ap-south-1-1.ec2.redns.redis-cloud.com:15262';

// connection
export const redis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy(times) {
    return Math.min(times * 200, 10_000);
  },
  reconnectOnError(err) {
    console.error('[redis] reconnectOnError', err?.message);
    return 1;
  },
  enableOfflineQueue: true,
});

export function wireRedisLogs(label = 'redis') {
  redis.on('error', (err) => console.error(`[${label}] error`, err));
  redis.on('connect', () => console.log(`[${label}] connected`));
  redis.on('ready', () => console.log(`[${label}] ready`));
  redis.on('end', () => console.warn(`[${label}] connection ended`));
}
