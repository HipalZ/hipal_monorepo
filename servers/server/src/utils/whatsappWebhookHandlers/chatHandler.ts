import { Subscriber, WhatsAppChat } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";

async function whatsAppChatHandler(
  userInput: string | undefined,
  userId: string,
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
) {
  try {
    // ✅ Guard: Skip if userInput is not a valid non-empty string
    if (typeof userInput !== "string" || !userInput.trim()) {
      console.warn(
        "[whatsAppChatHandler] Skipped empty or non-text input for user:",
        userId,
      );
      return;
    }

    const cleanText = userInput.trim();

    // ✅ Save the message to the WhatsAppChat collection
    await WhatsAppChat.create({
      businessId: whatsAppBusinessConfigData?.businessId,
      date: Date.now(),
      message: cleanText,
      isOwner: false,
      userId,
    });

    // ✅ Increment unseen count for subscriber if exists
    await Subscriber.findOneAndUpdate(
      {
        userId,
        businessId: whatsAppBusinessConfigData?.businessId,
      },
      {
        $inc: { whatsappMsgUnseenCount: 1 },
        $set: { lastUserMessageAt: Date.now() },
      },
      { new: true },
    );

    console.log(
      `[whatsAppChatHandler] Logged message for ${userId}: "${cleanText}"`,
    );
  } catch (error) {
    console.error("Error in whatsAppChatHandler:", error);
  }
}

export { whatsAppChatHandler };
