import { CheckInQr, CheckInQrUser } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import axios from "axios";
import whatsAppApiBaseUrl from "../whatsAppApiBaseUrl/apiPaths";

async function sendWhatsAppTemplateForCheckInQr(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  userPhone: string,
  code: string,
  checkInQrShortUrl: string,
  websiteLink: string,
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
            text: `Welcome to ${whatsAppBusinessConfigData?.businessName}! 👋\n\nThank you for being with us today. 🙏\nYour code: *${code}*\n\nWe hope you have a great experience! 😊`,
          },
          action: {
            name: "cta_url",
            parameters: {
              display_text: "Discover Us",
              url: checkInQrShortUrl,
            },
          },
          footer: websiteLink
            ? {
                text: `Find Us: ${websiteLink}`,
              }
            : undefined,
        },
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error sendWhatsAppInteractiveForCheckInQr:", error);
  }
}

async function sendCheckInQrAnanthDiamonds(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  userPhone: string,
) {
  try {
    const components = [
      {
        type: "header",
        parameters: [
          {
            type: "image",
            image: {
              link: "https://t-static.blr1.digitaloceanspaces.com/963a7db4-03ca-402f-a84b-ed1ddca7981f.jpeg",
            },
          },
        ],
      },
    ];
    await axios({
      method: "POST",
      url: `${whatsAppApiBaseUrl.BASE_URL}/${whatsAppBusinessConfigData?.version}/${whatsAppBusinessConfigData.phoneId}/messages?access_token=${whatsAppBusinessConfigData?.token}`,
      data: {
        messaging_product: "whatsapp",
        to: userPhone,
        type: "template",
        template: {
          name: "checkin_template",
          language: { code: "en_GB" },
          components,
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

    if (
      whatsAppBusinessConfigData?.businessId.toString() ===
      "68b02cdd0f1c7fb6848c3410"
    ) {
      try {
        await sendCheckInQrAnanthDiamonds(
          whatsAppBusinessConfigData,
          userPhone,
        );
      } catch (error) {
        console.error("Error sending Ananth Diamonds QR:", error);
      }
    } else {
      await sendWhatsAppTemplateForCheckInQr(
        whatsAppBusinessConfigData,
        userPhone,
        code,
        checkInQrShortUrl,
        websiteLink,
      );
    }
  } catch (error) {
    console.error("Error in sendWhatsAppTemplateForCheckInQr:", error);
  }
}

export { checkInQrHandler, sendWhatsAppTemplateForCheckInQr };
