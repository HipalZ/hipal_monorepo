import { BusinessSettings } from "@hi/db-models";
//@ts-ignore
import Razorpay from "razorpay";
import { getMerchantConfig, setMerchantConfig } from "./cacheHelper";

interface RazorpayInstance {
  keyId: string;
  keySecret: string;
  client: Razorpay;
}

export interface MerchantConfig {
  razorpayMerchantId: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
}

class RazorPayWrapper {
  private _instances: Map<string, RazorpayInstance> = new Map();

  async create(merchantId: string) {
    let config: MerchantConfig | null = await getMerchantConfig(merchantId);
    if (!config) {
      const merchant = await BusinessSettings.findOne({
        razorpayMerchantId: merchantId,
      }).select(
        "razorpayMerchantId razorpayKeyId razorpayKeySecret razorpayWebhookSecret",
      );

      if (!merchant) {
        throw new Error(
          `No configuration found for merchant ID: ${merchantId}`,
        );
      }

      config = {
        razorpayMerchantId: merchant.razorpayMerchantId,
        razorpayKeyId: merchant.razorpayKeyId,
        razorpayKeySecret: merchant.razorpayKeySecret,
        razorpayWebhookSecret: merchant.razorpayWebhookSecret,
      } as MerchantConfig;

      await setMerchantConfig(merchantId, config); // Cache the configuration
    }

    this._instances.set(merchantId, {
      keyId: config.razorpayKeyId,
      keySecret: config.razorpayKeySecret,
      client: new Razorpay({
        key_id: config.razorpayKeyId,
        key_secret: config.razorpayKeySecret,
      }),
    });
  }

  async getClient(merchantId: string): Promise<Razorpay> {
    if (!this._instances.has(merchantId)) {
      await this.create(merchantId);
    }
    return this._instances.get(merchantId)!.client;
  }
}

export const razorpayWrapper = new RazorPayWrapper();
