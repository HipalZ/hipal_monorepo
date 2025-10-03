import { CheckInQr, CheckInQrUser } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import axios from "axios";
import whatsAppApiBaseUrl from "../whatsAppApiBaseUrl/apiPaths";

async function sendWhatsAppTemplateForCheckInQr(
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
          body: bodyMessage,
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

async function checkInQrHandler(
  checkInQrName: string,
  userPhone: string,
  userId: string,
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
) {
  try {
    const checkInQrInfo = await CheckInQr.findOne({
      businessId: whatsAppBusinessConfigData?.businessId,
      name: checkInQrName,
    });

    if (!checkInQrInfo) {
      return null;
    }
    let checkInQrShortUrl = checkInQrInfo?.downloadLink;
    checkInQrShortUrl = `${checkInQrShortUrl}?q=wa&id=${userId}`;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await CheckInQrUser.findOneAndUpdate(
      {
        userId: userId,
        businessId: whatsAppBusinessConfigData?.businessId,
        qrId: checkInQrInfo?._id,
      },
      {
        code,
        date: Date.now(),
      },
      {
        upsert: true,
        new: true,
      },
    );

    const websiteLink = //@ts-ignore
      whatsAppBusinessConfigData.outLetId?.socialMediaLinks?.find(
        (item: { icon: string; link: string }) => item.icon === "website",
      )?.link;

    await sendWhatsAppTemplateForCheckInQr(
      whatsAppBusinessConfigData,
      userPhone,
      `Welcome to ${
        whatsAppBusinessConfigData?.businessName
      }! 👋\n\n Thank you for being with us today. 🙏\nYour code: *${code}*\n\n *Discover Us*: ${checkInQrShortUrl}\n\nWe hope you have a great experience! 😊\n\n *Find Us*: ${
        websiteLink || ""
      }`,
    );
  } catch (error) {
    console.error("Error in sendWhatsAppTemplateForCheckInQr:", error);
  }
}

export { checkInQrHandler, sendWhatsAppTemplateForCheckInQr };
