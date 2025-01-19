import { LRUCache } from "lru-cache";
export interface PosConfigTransfer {
  res: unknown;
}
const options = {
  max: 50000,
  // for use with tracking overall storage size
  maxSize: 10000,
  // how long to live in ms
  ttl: 1000 * 60 * 5,
  sizeCalculation: (value: unknown) => {
    return 1;
  },
};

export const cache = new LRUCache(options);

export const getMenuByBId = async (businessId: string) => {
  return cache.get(businessId);
};

export const setPosConfigTransfer = async (
  businessId: string,
  res: unknown,
) => {
  cache.set(businessId, res as PosConfigTransfer);
};
