import { Subscriber, WhatsAppChat } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";

async function whatsAppChatHandler(
  userInput: string,
  userId: string,
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
) {
  try {
    await WhatsAppChat.create({
      businessId: whatsAppBusinessConfigData?.businessId,
      date: Date.now(),
      message: userInput,
      isOwner: false,
      userId: userId,
    });

    await Subscriber.findOneAndUpdate(
      {
        userId: userId,
        businessId: whatsAppBusinessConfigData?.businessId,
      },
      {
        $inc: {
          whatsappMsgUnseenCount: 1,
        },
      },
      { new: true },
    );
  } catch (error) {
    console.error("Error in whatsAppChatHandler:", error);
  }
}

export { whatsAppChatHandler };
