import { LRUCache } from "lru-cache";
interface MerchantConfig {
  razorpayMerchantId: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
}

interface ShortUrl {
  longUrl: string;
}
const options = {
  max: 50000,
  // for use with tracking overall storage size
  maxSize: 10000,
  // how long to live in ms
  ttl: 1000 * 60 * 60 * 24 * 60,
  sizeCalculation: (value: unknown) => {
    return 1;
  },
};

export const cache = new LRUCache(options);

export const getMerchantConfig = async (merchantId: string) => {
  return cache.get(merchantId);
};

export const setMerchantConfig = async (
  merchantId: string,
  config: unknown,
) => {
  cache.set(merchantId, config as MerchantConfig);
};

export const setShortUrl = async (urlCode: string, longUrl: string) => {
  cache.set(urlCode, longUrl);
};

export const getShortUrl = async (urlCode: string) => {
  return cache.get(urlCode);
};
