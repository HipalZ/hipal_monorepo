import { LRUCache } from "lru-cache";

const options = {
  max: 50000,
  // for use with tracking overall storage size
  maxSize: 10000,
  // how long to live in ms
  ttl: 1000 * 60 * 60 * 24 * 5,
  sizeCalculation: (value: unknown) => {
    return 1;
  },
};

export const cache = new LRUCache(options);

export const getTemplateId = async (wamid: string) => {
  return cache.get(wamid);
};

export const setWhatsAppMessageConfig = async (
  wamid: string,
  templateId: string,
) => {
  cache.set(wamid, templateId as string);
};
