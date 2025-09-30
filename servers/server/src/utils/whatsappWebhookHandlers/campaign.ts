import { WhatsAppAnalyticsUser, WhatsAppWallet } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";

async function whatsAppCampaignHandler(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  //@ts-ignore
  statuses,
) {
  try {
    const firstStatus = statuses[0];
    const extractedData = {
      status: firstStatus.status,
      category: firstStatus.pricing?.category,
    };

    const wamid = firstStatus.id;

    const findUserByMessageId = await WhatsAppAnalyticsUser.findOne({
      messageId: wamid,
    });

    if (findUserByMessageId) {
      await WhatsAppAnalyticsUser.create({
        businessId: findUserByMessageId?.businessId,
        campaignId: findUserByMessageId?.campaignId,
        userId: findUserByMessageId?.userId,
        templateId: findUserByMessageId?.templateId,
        status: firstStatus?.status,
        date: Date.now(),
        messageId: wamid,
        error: firstStatus?.errors,
      });
    }

    if (
      extractedData?.status === "delivered" &&
      extractedData?.category === "marketing"
    ) {
      // Fetch the current balance
      const wallet = await WhatsAppWallet.findOne({
        businessId: whatsAppBusinessConfigData?.businessId,
      });

      const minimumAmount =
        whatsAppBusinessConfigData?.marketingTemplateCost || 0.89;

      if (wallet && wallet.currentBalance >= minimumAmount) {
        // Update the balance only if it won't go negative
        await WhatsAppWallet.findOneAndUpdate(
          { businessId: whatsAppBusinessConfigData?.businessId },
          { $inc: { currentBalance: -minimumAmount } },
        );
      } else {
        console.log("Insufficient balance to decrement");
      }
    }
    if (
      extractedData?.status === "delivered" &&
      extractedData?.category === "utility"
    ) {
      // Fetch the current balance
      const wallet = await WhatsAppWallet.findOne({
        businessId: whatsAppBusinessConfigData?.businessId,
      });

      const minimumAmount =
        whatsAppBusinessConfigData?.utilityTemplateCost || 0.2;

      if (wallet && wallet.currentBalance >= minimumAmount) {
        // Update the balance only if it won't go negative
        await WhatsAppWallet.findOneAndUpdate(
          { businessId: whatsAppBusinessConfigData?.businessId },
          { $inc: { currentBalance: -minimumAmount } },
        );
      } else {
        console.log("Insufficient balance to decrement");
      }
    }
  } catch (error) {
    console.error("Error in checkInQrHandler:", error);
  }
}

export { whatsAppCampaignHandler };
