import { Table } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import axios from "axios";
import whatsAppApiBaseUrl from "../whatsAppApiBaseUrl/apiPaths";

async function sendWhatsAppTemplateForTableQr(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  userPhone: string,
  tableQrShortUrl: string,
  tableName?: string,
  userId?: string,
) {
  try {
    const defaultMessage = `Welcome to ${whatsAppBusinessConfigData?.businessName}! ✨\n\nThank you for connecting with us.\n\nTap below to continue and discover a seamless experience designed for you.`
    const defaultUrlText = "Explore Us";

    let messageText = whatsAppBusinessConfigData?.tableQrCustomMessage || defaultMessage;
    // Replace placeholders in message
    messageText = messageText.replace(/{{business_name}}/g, whatsAppBusinessConfigData?.businessName || "");
    if (tableName) {
      messageText = messageText.replace(/{{table_name}}/g, tableName);
    }

    const urlText = whatsAppBusinessConfigData?.tableQrCustomUrlText || defaultUrlText;
    let finalUrl = whatsAppBusinessConfigData?.tableQrCustomUrl || tableQrShortUrl;

    // Interpolate dynamic variables in custom URL
    if (whatsAppBusinessConfigData?.tableQrCustomUrl) {
      finalUrl = finalUrl.replace(/{{userId}}/g, userId || "");
      finalUrl = finalUrl.replace(/{{tableName}}/g, tableName || "");
      finalUrl = finalUrl.replace(/{{userPhone}}/g, userPhone || "");
    }

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
            text: messageText,
          },
          action: {
            name: "cta_url",
            parameters: {
              display_text: urlText,
              url: finalUrl,
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
      tableName,
      userId,
    );
  } catch (error) {
    console.error("Error in tableQrHandler:", error);
  }
}

export { sendWhatsAppTemplateForTableQr, tableQrHandler };
