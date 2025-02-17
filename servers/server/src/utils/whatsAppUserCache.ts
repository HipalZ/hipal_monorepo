import { LRUCache } from "lru-cache";
export interface CampaignConfig {
  templateId: string;
  campaignId: string;
}
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
  CampaignConfigData: CampaignConfig,
) => {
  cache.set(wamid, CampaignConfigData as CampaignConfig);
};

export const getBlockedUser = async (phone: string) => {
  return cache.get(phone);
};

export const setBlockedUser = async (phone: string, value: string) => {
  cache.set(phone, value as string);
};

export const deleteBlockedUser = async (phone: string) => {
  cache.delete(phone);
};
