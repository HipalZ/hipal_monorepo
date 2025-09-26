import { User, WhatsAppBusinessConfig } from "@hi/db-models";
import type { QrParseResult, QrType } from "./whatsAppHandlerTypes";
//@ts-ignore
async function whatsAppEventData(whatsAppWebhookEventBody) {
  const entry = whatsAppWebhookEventBody.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const messages = value?.messages?.[0];
  const contacts = value?.contacts?.[0];
  const statuses = value?.statuses;

  const phon_no_id = value?.metadata?.phone_number_id;

  const whatsAppBusinessConfigData = await WhatsAppBusinessConfig.findOne({
    phoneId: phon_no_id,
  });

  return {
    entry,
    changes,
    value,
    messages,
    contacts,
    statuses,
    whatsAppBusinessConfigData,
  };
}
//@ts-ignore
async function whatsAppUserAndTextMessage(contacts, messages) {
  const userName = contacts?.profile?.name;
  const userPhone = contacts?.wa_id?.toString().slice(2);
  const userInput = messages?.text?.body;

  let isAlreadyRegisteredUser = await User.findOne({
    phone: userPhone,
  });

  if (!isAlreadyRegisteredUser) {
    isAlreadyRegisteredUser = await User.create({
      phone: userPhone,
      name: userName,
      role: ["HIPAL_CUSTOMER", "OWNER", "MANAGER", "CAPTAIN", "CO_OWNER"],
    });
  }

  return {
    userData: isAlreadyRegisteredUser,
    userInput,
  };
}

function identifyQrTypeFromMessage(userInput: string): QrParseResult {
  if (!userInput) return null;

  const patterns: Array<{ qrType: QrType; re: RegExp }> = [
    { qrType: "TABLE_QR", re: /\bdetails-\s*([A-Za-z0-9_-]+)/i },
    { qrType: "CHECK_IN_QR", re: /\bQR-\s*([A-Za-z0-9_-]+)/i },
    { qrType: "COUPON_QR", re: /\blink-\s*([A-Za-z0-9_-]+)/i },
    { qrType: "ROOM_QR", re: /\broom-\s*([A-Za-z0-9_-]+)/i },
  ];

  for (const { qrType, re } of patterns) {
    const m = userInput.match(re);
    if (m) {
      return { qrType, value: m[1], match: m[0] };
    }
  }
  return null;
}

export {
  identifyQrTypeFromMessage,
  whatsAppEventData,
  whatsAppUserAndTextMessage,
};
