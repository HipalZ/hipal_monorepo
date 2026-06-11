import { Subscriber, User, UserAnalytic, WhatsAppBusinessConfig } from '@hi/db-models';
import type { QrParseResult, QrType } from './whatsAppHandlerTypes';
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
async function whatsAppUserAndTextMessage(
  //@ts-ignore
  contacts,
  //@ts-ignore
  messages,
  //@ts-ignore
  whatsAppBusinessConfigData,
) {
  const userName = contacts?.profile?.name;
  const userPhone = contacts?.wa_id?.toString().slice(2);
  const userInput = messages?.text?.body;

  let isAlreadyRegisteredUser = await User.findOne({
    phone: userPhone,
  });

  const isNewUser = !isAlreadyRegisteredUser;
  console.log(
    `[WA-Webhook] Phone: ${userPhone} | Name: ${userName} | Existing user: ${!isNewUser}${
      isAlreadyRegisteredUser ? ` | userId: ${isAlreadyRegisteredUser._id}` : ''
    }`,
  );

  // Create user FIRST so we have a valid userId for Subscriber and UserAnalytic
  if (isNewUser) {
    isAlreadyRegisteredUser = await User.create({
      phone: userPhone,
      name: userName,
      role: ['HIPAL_CUSTOMER', 'OWNER', 'MANAGER', 'CAPTAIN', 'CO_OWNER'],
    });
    console.log(`[WA-Webhook] NEW USER CREATED | userId: ${isAlreadyRegisteredUser._id} | phone: ${userPhone} | name: ${userName}`);
  }

  const isAlreadySubscribed = await Subscriber.findOne({
    userId: isAlreadyRegisteredUser._id.toString(),
    businessId: whatsAppBusinessConfigData?.businessId,
  });

  if (!isAlreadySubscribed) {
    const subscriber = await Subscriber.findOneAndUpdate(
      {
        userId: isAlreadyRegisteredUser._id.toString(),
        businessId: whatsAppBusinessConfigData?.businessId,
      },
      {
        date: Date.now(),
        phone: userPhone,
        name: userName,
        userCount: 0,
        whatsappMsgUnseenCount: 0,
      },
      { upsert: true, new: true },
    );
    console.log(
      `[WA-Webhook] NEW SUBSCRIBER CREATED | subscriberId: ${subscriber?._id} | userId: ${isAlreadyRegisteredUser._id} | businessId: ${whatsAppBusinessConfigData?.businessId}`,
    );
  } else {
    console.log(`[WA-Webhook] Existing subscriber found | subscriberId: ${isAlreadySubscribed._id} | userId: ${isAlreadyRegisteredUser._id}`);
  }

  const userAnalytics = await UserAnalytic.findOne({
    userId: isAlreadyRegisteredUser._id.toString(),
    businessId: whatsAppBusinessConfigData?.businessId,
  });

  if (!userAnalytics) {
    // visitCount starts at 0 — the QR-scan VisitEvent hook in the
    // webhook does the +1 (deduped per day). Starting at 1 here would
    // double-count a first-time scanner.
    const analytics = await UserAnalytic.create({
      userId: isAlreadyRegisteredUser._id.toString(),
      businessId: whatsAppBusinessConfigData?.businessId,
      visitCount: 0,
      totalSpend: 0,
      avgSpend: 0,
      dateOfJoining: Date.now(),
    });
    console.log(`[WA-Webhook] NEW USER ANALYTICS CREATED | analyticsId: ${analytics._id} | userId: ${isAlreadyRegisteredUser._id}`);
  }

  console.log(
    `[WA-Webhook] SUMMARY | ${isNewUser ? 'NEW' : 'EXISTING'} user | userId: ${
      isAlreadyRegisteredUser._id
    } | phone: ${userPhone} | message: ${userInput || '(media/no text)'}`,
  );

  return {
    userData: isAlreadyRegisteredUser,
    userInput,
  };
}

function identifyQrTypeFromMessage(userInput: string): QrParseResult | null {
  if (!userInput) return null;

  const patterns: Array<{ qrType: QrType; re: RegExp }> = [
    { qrType: 'TABLE_QR', re: /\bdetails(?:\s*-\s*([\w\W]+))?$/i },
    { qrType: 'CHECK_IN_QR', re: /\bQR\s*-\s*([\w\W]+)/i },
    { qrType: 'COUPON_QR', re: /\blink\s*-\s*([\w\W]+)/i },
    { qrType: 'ROOM_QR', re: /\broom\s*-\s*([\w\W]+)/i },
  ];

  for (const { qrType, re } of patterns) {
    const m = userInput.match(re);
    if (m) {
      const raw = m[1]?.trim() || '';
      // Treat "undefined" as empty — this happens when the QR scan
      // redirect had no table name (tableInfo was null in /surl/)
      const value = raw === 'undefined' ? '' : raw;
      return {
        qrType,
        value,
        match: m[0],
      };
    }
  }
  return null;
}

export { identifyQrTypeFromMessage, whatsAppEventData, whatsAppUserAndTextMessage };
