import { createClient, RedisClientType } from 'redis';

class RedisWrapper {
  private _client?: RedisClientType<any, any>;

  connect(host: string) {
    this._client = createClient({ url: `redis://${host}:6379` });

    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to Redis');
        resolve();
      });
      this.client.on('error', (err: any) => {
        reject(err);
      });
      this.client.connect();
    });
  }

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }

    return this._client;
  }
}

export const redisWrapper = new RedisWrapper();
