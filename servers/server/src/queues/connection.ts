import IORedis from 'ioredis';

// connection
export const redis = new IORedis(
  'redis://default:PjfYHxWk3evOs8eO75hqF3lnh6nSK2RB@redis-15427.crce179.ap-south-1-1.ec2.redns.redis-cloud.com:15427',
  {
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
  },
);

export function wireRedisLogs(label = 'redis') {
  redis.on('error', (err) => console.error(`[${label}] error`, err));
  redis.on('connect', () => console.log(`[${label}] connected`));
  redis.on('ready', () => console.log(`[${label}] ready`));
  redis.on('end', () => console.warn(`[${label}] connection ended`));
}
