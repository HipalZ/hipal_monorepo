import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";

async function whatsAppCampaignHandler(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
) {
  try {
    // const firstStatus = statuses[0];
    // const extractedData = {
    //   status: firstStatus.status,
    //   category: firstStatus.pricing?.category,
    // };

    // const wamid = firstStatus.id;

    //   const getTemplateIdInfo = (await getTemplateId(
    //     wamid,
    //   )) as CampaignConfig;

    //   const userInfo = await User.findOne({
    //     phone: userPhoneNumber,
    //   });

    //   if (getTemplateIdInfo && extractedData.category !== "service") {
    //     await WhatsAppAnalyticsUser.findOneAndUpdate(
    //       {
    //         businessId: config?.businessId,
    //         phone: userInfo?.phone,
    //         status: extractedData?.status,
    //         templateId: getTemplateIdInfo.templateId,
    //         campaignId: getTemplateIdInfo.campaignId,
    //       },
    //       {
    //         businessId: config?.businessId,
    //         name: userInfo?.name,
    //         phone: userInfo?.phone,
    //         status: extractedData?.status,
    //         templateId: getTemplateIdInfo.templateId,
    //         date: Date.now(),
    //         campaignId: getTemplateIdInfo.campaignId,
    //       },
    //       {
    //         upsert: true,
    //         new: true,
    //       },
    //     );
    //   }

    //   if (
    //     extractedData?.status === "delivered" &&
    //     extractedData?.category === "marketing"
    //   ) {
    //     // Fetch the current balance
    //     const wallet = await WhatsAppWallet.findOne({
    //       businessId: config?.businessId,
    //     });

    //     const minimumAmount = config?.marketingTemplateCost || 0.89;

    //     if (wallet && wallet.currentBalance >= minimumAmount) {
    //       // Update the balance only if it won't go negative
    //       await WhatsAppWallet.findOneAndUpdate(
    //         { businessId: config?.businessId },
    //         { $inc: { currentBalance: -minimumAmount } },
    //       );
    //     } else {
    //       console.log("Insufficient balance to decrement");
    //     }
    //   }
    console.log("whatsAppCampaignHandler executed", whatsAppBusinessConfigData);
  } catch (error) {
    console.error("Error in checkInQrHandler:", error);
  }
}

export { whatsAppCampaignHandler };
