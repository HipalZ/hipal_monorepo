import { Table } from '@hi/db-models';
import type { WhatsAppBusinessConfigType } from '@hi/db-models/src/validators';
import axios from 'axios';
import whatsAppApiBaseUrl from '../whatsAppApiBaseUrl/apiPaths';

/**
 * Replace all supported placeholders in a string.
 * Used for both message body and custom URL interpolation.
 */
function interpolateTokens(text: string, businessName: string, tableName?: string, userId?: string, userPhone?: string, payLink?: string): string {
  return text
    .replace(/{{business_name}}/g, businessName || '')
    .replace(/{{table_name}}/g, tableName || '')
    .replace(/{{tableName}}/g, tableName || '')
    .replace(/{{userId}}/g, userId || '')
    .replace(/{{userPhone}}/g, userPhone || '')
    .replace(/{{payLink}}/g, payLink || '');
}

async function sendWhatsAppTemplateForTableQr(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  userPhone: string,
  tableQrShortUrl: string,
  tableName?: string,
  userId?: string,
) {
  try {
    const businessName = whatsAppBusinessConfigData?.businessName || '';
    // Default to INTERACTIVE when the field is missing (backward-compatible)
    const messageType = (whatsAppBusinessConfigData as any)?.tableQrMessageType || 'INTERACTIVE';

    const defaultMessage = `Welcome to ${businessName}! ✨\n\nThank you for connecting with us.\n\nTap below to continue and discover a seamless experience designed for you.`;
    const defaultUrlText = 'Explore Us';

    // ── Resolve the final destination URL ──
    // If the business has a custom URL template, interpolate it with the
    // actual values. Otherwise use the default tableQrShortUrl.
    let payLink = tableQrShortUrl;
    if (whatsAppBusinessConfigData?.tableQrCustomUrl) {
      payLink = interpolateTokens(whatsAppBusinessConfigData.tableQrCustomUrl, businessName, tableName, userId, userPhone, tableQrShortUrl);
    }

    // Interpolate placeholders in the message body (uses the resolved payLink)
    const messageText = interpolateTokens(
      whatsAppBusinessConfigData?.tableQrCustomMessage || defaultMessage,
      businessName,
      tableName,
      userId,
      userPhone,
      payLink,
    );

    const apiUrl = `${whatsAppApiBaseUrl.BASE_URL}/${whatsAppBusinessConfigData?.version}/${whatsAppBusinessConfigData.phoneId}/messages?access_token=${whatsAppBusinessConfigData?.token}`;

    // ── TEXT mode: plain text message, link embedded via {{payLink}} ──
    if (messageType === 'TEXT') {
      await axios({
        method: 'POST',
        url: apiUrl,
        data: {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: userPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: messageText,
          },
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return;
    }

    // ── INTERACTIVE mode: CTA URL button (default) ──
    const urlText = whatsAppBusinessConfigData?.tableQrCustomUrlText || defaultUrlText;

    await axios({
      method: 'POST',
      url: apiUrl,
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: userPhone,
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          body: {
            text: messageText,
          },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: urlText,
              url: payLink,
            },
          },
        },
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error sendWhatsAppInteractiveForTableQr:', error);
  }
}

async function tableQrHandler(tableName: string, userPhone: string, userId: string, whatsAppBusinessConfigData: WhatsAppBusinessConfigType) {
  try {
    // 1. Try to find the specific table the user scanned
    let tableInfo = tableName
      ? await Table.findOne({
          businessId: whatsAppBusinessConfigData?.businessId,
          name: tableName,
        })
      : null;

    // 2. If no matching table (or no tableName passed), fall back to ANY
    // table for this business — just so we have a business-level link
    // for auto-login. The message still goes out, but without tableName
    // in the URL or body.
    let resolvedTableName: string | undefined = tableInfo?.name;
    if (!tableInfo) {
      tableInfo = await Table.findOne({
        businessId: whatsAppBusinessConfigData?.businessId,
      });
      resolvedTableName = undefined; // omit tableName from URL/body
    }

    // 3. Build the default URL. If we have no table at all (brand new
    // business with zero tables), leave it empty — the custom URL
    // template (if configured) can still resolve, otherwise the message
    // body will just not include a link.
    let tableQrShortUrl = '';
    if (tableInfo?.tableLink) {
      tableQrShortUrl = `${tableInfo.tableLink}?q=wa&id=${userId}`;
    }

    await sendWhatsAppTemplateForTableQr(whatsAppBusinessConfigData, userPhone, tableQrShortUrl, resolvedTableName, userId);
  } catch (error) {
    console.error('Error in tableQrHandler:', error);
  }
}

export { sendWhatsAppTemplateForTableQr, tableQrHandler };
