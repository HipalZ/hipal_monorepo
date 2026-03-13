import { Table } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import axios from "axios";
import whatsAppApiBaseUrl from "../whatsAppApiBaseUrl/apiPaths";

async function sendWhatsAppTemplateForTableQr(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  userPhone: string,
  tableQrShortUrl: string,
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
            text: `Welcome to ${whatsAppBusinessConfigData?.businessName}! ✨\n\nThank you for connecting with us.\n\nTap below to continue and discover a seamless experience designed for you.`
          },
          action: {
            name: "cta_url",
            parameters: {
              display_text: "Explore Us",
              url: tableQrShortUrl,
            },
          },
        },
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error sendWhatsAppInteractiveForTableQr:", error);
  }
}

async function tableQrHandler(
  tableName: string,
  userPhone: string,
  userId: string,
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
) {
  try {
    const tableInfo = await Table.findOne({
      businessId: whatsAppBusinessConfigData?.businessId,
      name: tableName,
    });
    if (!tableInfo) {
      return null;
    }
    let tableQrShortUrl = tableInfo?.tableLink;
    tableQrShortUrl = `${tableQrShortUrl}?q=wa&id=${userId}`;
    await sendWhatsAppTemplateForTableQr(
      whatsAppBusinessConfigData,
      userPhone,
      tableQrShortUrl,
    );
  } catch (error) {
    console.error("Error in tableQrHandler:", error);
  }
}

export { sendWhatsAppTemplateForTableQr, tableQrHandler };
