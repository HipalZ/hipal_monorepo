import { Table } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import axios from "axios";
import whatsAppApiBaseUrl from "../whatsAppApiBaseUrl/apiPaths";

async function sendWhatsAppTemplateForTableQr(
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
    console.error("Error sendWhatsAppTemplateForTableQr:", error);
  }
}

async function tableQrHandler(
  tableName: string,
  userPhone: string,
  userId: string,
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
) {
  try {
    console.log("tableQrHandler", tableName);
    console.log("businessId", whatsAppBusinessConfigData?.businessId);
    const tableInfo = await Table.findOne({
      businessId: whatsAppBusinessConfigData?.businessId,
      name: tableName,
    });
    console.log("tableInfoHandle", tableInfo);
    if (!tableInfo) {
      return null;
    }
    let tableQrShortUrl = tableInfo?.tableLink;
    tableQrShortUrl = `${tableQrShortUrl}?q=wa&id=${userId}`;

    await sendWhatsAppTemplateForTableQr(
      whatsAppBusinessConfigData,
      userPhone,
      `Welcome to ${whatsAppBusinessConfigData?.businessName}! \n\n We’re excited to offer you an exceptional dining experience.\n🔗 Explore Menu: ${tableQrShortUrl}\n\n🍽️ View our curated menu featuring handcrafted delights.`,
    );
  } catch (error) {
    console.error("Error in tableQrHandler:", error);
  }
}

export { sendWhatsAppTemplateForTableQr, tableQrHandler };
