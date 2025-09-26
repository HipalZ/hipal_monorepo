import { UrlModel } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import axios from "axios";
import whatsAppApiBaseUrl from "../whatsAppApiBaseUrl/apiPaths";

async function sendWhatsAppTemplateForCouponQr(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  userPhone: string,
  bodyMessage: string,
) {
  try {
    await axios({
      method: "POST",
      url: `${whatsAppApiBaseUrl.BASE_URL}/${whatsAppBusinessConfigData?.version}/${whatsAppBusinessConfigData.phoneId}/messages?access_token=${whatsAppBusinessConfigData?.token}`,
      data: {
        messaging_product: "whatsapp",
        to: userPhone,
        text: {
          body: `🎉 *${whatsAppBusinessConfigData?.businessName}* offers you exclusive benefits.\n🔗 Click below to grab your special coupon curated just for you. \n${bodyMessage}`,
        },
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error sendWhatsAppTemplateForCheckInQr:", error);
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

    console.log("couponQrInfo", couponQrInfo);
    if (!couponQrInfo) {
      return null;
    }
    let couponQrShortUrl = couponQrInfo?.shortUrl;
    couponQrShortUrl = `${couponQrShortUrl}?q=wa&id=${userId}}`;

    await sendWhatsAppTemplateForCouponQr(
      whatsAppBusinessConfigData,
      userPhone,
      `🎉 *${whatsAppBusinessConfigData?.businessName}* offers you exclusive benefits.\n🔗 Click below to grab your special coupon curated just for you. \n${couponQrShortUrl}`,
    );
  } catch (error) {
    console.error("Error in checkInQrHandler:", error);
  }
}

export { couponQrHandler, sendWhatsAppTemplateForCouponQr };
