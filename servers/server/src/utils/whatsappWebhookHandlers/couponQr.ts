import { UrlModel } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import axios from "axios";
import whatsAppApiBaseUrl from "../whatsAppApiBaseUrl/apiPaths";

async function sendWhatsAppTemplateForCouponQr(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  userPhone: string,
  couponQrShortUrl: string,
) {
  try {
    await axios({
      method: "POST",
      url: `${whatsAppApiBaseUrl.BASE_URL}/${whatsAppBusinessConfigData?.version}/${whatsAppBusinessConfigData.phoneId}/messages?access_token=${whatsAppBusinessConfigData?.token}`,
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: userPhone,
        type: "interactive",
        interactive: {
          type: "cta_url",
          body: {
            text: `🎉 *${whatsAppBusinessConfigData?.businessName}* brings you exclusive rewards!\n\nTap below to grab your special coupon curated just for you. 💝`,
          },
          action: {
            name: "cta_url",
            parameters: {
              display_text: "Grab My Coupon",
              url: couponQrShortUrl,
            },
          },
          footer: {
            text: "Limited-time offer — redeem before it expires!",
          },
        },
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error sendWhatsAppInteractiveForCouponQr:", error);
  }
}

async function couponQrHandler(
  couponCode: string,
  userPhone: string,
  userId: string,
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
) {
  try {
    const couponQrInfo = await UrlModel.findOne({
      urlCode: couponCode,
    });

    if (!couponQrInfo) {
      return null;
    }
    let couponQrShortUrl = couponQrInfo?.shortUrl;
    couponQrShortUrl = `${couponQrShortUrl}?q=wa&id=${userId}}`;

    await sendWhatsAppTemplateForCouponQr(
      whatsAppBusinessConfigData,
      userPhone,
      couponQrShortUrl,
    );
  } catch (error) {
    console.error("Error in sendWhatsAppTemplateForCouponQr:", error);
  }
}

export { couponQrHandler, sendWhatsAppTemplateForCouponQr };
