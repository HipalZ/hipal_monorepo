import {
  RecentCampaign,
  WhatsAppAnalyticsUser,
  WhatsAppBlockedUser,
} from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";

async function whatsAppBlockUserHandler(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  userPhone: string,
  userId: string,
  messageId: string,

  userInput: string,
) {
  try {
    if (userInput.trim().toLowerCase() === "stop") {
      const RecentCampaignData = await RecentCampaign.findOne({
        businessId: whatsAppBusinessConfigData?.businessId,
      });

      const ifAlreadyBlocked = await WhatsAppBlockedUser.findOne({
        phone: userPhone,
      });

      if (!ifAlreadyBlocked) {
        await WhatsAppAnalyticsUser.create({
          businessId: RecentCampaignData?.businessId,
          userId: userId,
          status: "blocked",
          templateId: RecentCampaignData?.templateId,
          date: Date.now(),
          campaignId: RecentCampaignData?.campaignId,
          messageId: messageId,
        });

        await WhatsAppBlockedUser.findOneAndUpdate(
          {
            phone: userPhone,
          },
          {
            phone: userPhone,
          },
          {
            upsert: true,
            new: true,
          },
        );
      }
    }
    if (userInput.trim().toLowerCase() === "unstop") {
      await WhatsAppBlockedUser.findOneAndDelete({
        phone: userPhone,
      });
    }
  } catch (error) {
    console.error("Error in whatsAppBlockUserHandler:", error);
  }
}

export { whatsAppBlockUserHandler };
