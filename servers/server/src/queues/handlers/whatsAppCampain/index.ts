import { WhatsAppAnalyticsUser } from "@hi/db-models";
import axios from "axios";
import type { Job } from "bullmq";
import type { sendTemplateTypeValidator } from "../../types/jobtypes";

async function sendTemplate(job: Job) {
  const {
    components,
    to,
    token,
    version,
    phoneId,
    templateName,
    languageCode,
    whatsAppApiBaseUrl,
    businessId,
    templateId,
    campaignId,
    userId,
  } = job.data as sendTemplateTypeValidator;

  console.log("sending template");
  console.log("data", job.data);

  try {
    const res = await axios.post(
      `${whatsAppApiBaseUrl}${version}/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to.toString(),
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: components,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("messageId", res.data?.messages?.[0]?.id);
    console.log("businessId", businessId);
    console.log("templateId", templateId);
    console.log("campaignId", campaignId);
    console.log("userId", userId);
    try {
      await WhatsAppAnalyticsUser.create({
        messageId: res.data?.messages?.[0]?.id,
        businessId,
        templateId,
        campaignId: campaignId,
        date: Date.now(),
        status: "pending",
        userId: userId,
        error: [],
      });
    } catch (error) {
      console.log("error creating whatsapp analytics user", error);
    }

    console.log("whatsapp response", res.data);
  } catch (error) {
    console.log("error sending whatsapp message", error);
  }
}

export const whatsappHandlers = {
  sendTemplate,
};
