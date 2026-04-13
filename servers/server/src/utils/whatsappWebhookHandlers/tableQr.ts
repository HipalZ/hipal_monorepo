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
    // Replace all placeholders — use empty string for missing values
    messageText = messageText.replace(/{{business_name}}/g, whatsAppBusinessConfigData?.businessName || "");
    messageText = messageText.replace(/{{table_name}}/g, tableName || "");
    messageText = messageText.replace(/{{tableName}}/g, tableName || "");
    messageText = messageText.replace(/{{userId}}/g, userId || "");
    messageText = messageText.replace(/{{userPhone}}/g, userPhone || "");
    messageText = messageText.replace(/{{payLink}}/g, tableQrShortUrl || "");

    const urlText = whatsAppBusinessConfigData?.tableQrCustomUrlText || defaultUrlText;
    let finalUrl = whatsAppBusinessConfigData?.tableQrCustomUrl || tableQrShortUrl;

    // Interpolate dynamic variables in custom URL
    if (whatsAppBusinessConfigData?.tableQrCustomUrl) {
      finalUrl = finalUrl.replace(/{{userId}}/g, userId || "");
      finalUrl = finalUrl.replace(/{{tableName}}/g, tableName || "");
      finalUrl = finalUrl.replace(/{{userPhone}}/g, userPhone || "");

      // Clean up empty query params left by missing values
      // e.g. "?tableName=&id=abc" → "?id=abc"
      try {
        const urlObj = new URL(finalUrl);
        for (const [key, value] of [...urlObj.searchParams.entries()]) {
          if (!value) urlObj.searchParams.delete(key);
        }
        finalUrl = urlObj.toString();
      } catch {
        // not a valid URL, use as-is
      }
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
    let tableQrShortUrl = "";

    if (tableName) {
      // Table name provided — find the specific table and use its link
      const tableInfo = await Table.findOne({
        businessId: whatsAppBusinessConfigData?.businessId,
        name: tableName,
      });
      if (tableInfo?.tableLink) {
        tableQrShortUrl = `${tableInfo.tableLink}?q=wa&id=${userId}`;
      }
    }

    // If no URL yet (no tableName, or table not found), use any table's
    // link for this business — just for auto-login redirect, no tableName
    if (!tableQrShortUrl) {
      const anyTable = await Table.findOne({
        businessId: whatsAppBusinessConfigData?.businessId,
      });
      if (anyTable?.tableLink) {
        tableQrShortUrl = `${anyTable.tableLink}?q=wa&id=${userId}`;
      }
    }

    // Still no URL — nothing to send
    if (!tableQrShortUrl) {
      console.error(
        `[tableQrHandler] No table found for business ${whatsAppBusinessConfigData?.businessId}`,
      );
      return null;
    }

    await sendWhatsAppTemplateForTableQr(
      whatsAppBusinessConfigData,
      userPhone,
      tableQrShortUrl,
      tableName || undefined,
      userId,
    );
  } catch (error) {
    console.error("Error in tableQrHandler:", error);
  }
}

export { sendWhatsAppTemplateForTableQr, tableQrHandler };
