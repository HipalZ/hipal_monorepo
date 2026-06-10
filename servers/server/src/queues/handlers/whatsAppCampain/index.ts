import { WhatsAppAnalyticsUser } from "@hi/db-models";
import axios from "axios";
import type { Job } from "bullmq";
import type {
  AxiosError,
  sendTemplateTypeValidator,
} from "../../types/jobtypes";
import { returnBodyComponents } from "../../utils/helper";
import { WHATSAPP_META_PAUSED } from "../../../utils/whatsAppApiBaseUrl/apiPaths";
// import { enqueueWhatsAppJob } from "../../enqueue";

async function sendTemplate(job: Job) {
  // [META-PAUSED] Worker-level guard. If a job is already in the queue when
  // the kill switch is flipped on, drop it cleanly instead of failing N times
  // against Meta — BullMQ would otherwise retry until `attempts` is exhausted.
  if (WHATSAPP_META_PAUSED) {
    console.warn(
      "[whatsAppCampaign.sendTemplate] skipped — WHATSAPP_META_PAUSED is ON",
      { jobId: job.id },
    );
    return { skipped: true, reason: "WHATSAPP_META_PAUSED" };
  }
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
    category,
  } = job.data as sendTemplateTypeValidator;

  const apiEndpoint =
    category === "UTILITY" ? "messages" : "marketing_messages";

  console.log("endpoint", apiEndpoint);

  try {
    const res = await axios.post(
      `${whatsAppApiBaseUrl}${version}/${phoneId}/${apiEndpoint}`,
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
    } catch (error) {}
  } catch (error) {
    const err = error as AxiosError;
    const errorMessage =
      err?.response?.data?.error?.message || err?.message || "Unknown error";
    const token =
      "EAAQk2VVQJsEBOZBP8xHCHCZAvBWeAX1APC5E08Y0PCMCTGemp6OUsJrugkr6nNNYWnnrJcTL18GHoRzRBPuW2L0CGQvkK98djZBCxaAkUxKbH148EOMtYGxvj87NTqPz9TfoyjdVWMp5sKgZBI5tIdI4yvGBtyxsRCY5y81ZBvlYdLQNCaqQQP94ZC5llBP1EtJAZDZD";

    try {
      await axios({
        method: "POST",
        url: `${whatsAppApiBaseUrl}${version}/540847672441832/messages`,
        data: {
          messaging_product: "whatsapp",
          to: "9588413799",
          text: {
            body: errorMessage,
          },
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {}
  }
}

async function pushCustomerIntoQueue(job: Job) {
  const {
    businessName,
    address,
    bodyVariableSequence,
    imageUrl,
    token,
    version,
    phoneId,
    templateName,
    languageCode,
    whatsAppApiBaseUrl,
    businessId,
    templateId,
    campaignId,
    customersArray,
    category,
  } = job.data;

  for (const customer of customersArray) {
    // return components for the body
    const components = await returnBodyComponents(
      businessName,
      address,
      bodyVariableSequence,
      imageUrl,
      customer,
      businessId,
    );

    const payload = {
      whatsAppApiBaseUrl: whatsAppApiBaseUrl,
      version: version,
      phoneId: phoneId,
      to: customer?.phone?.toString(),
      templateName: templateName,
      languageCode: languageCode,
      components: components,
      token: token,
      businessId,
      templateId,
      campaignId: campaignId,
      userId: customer._id,
      category: category,
    };
    console.log("Enqueuing for ", customer?.phone?.toString());
    // await enqueueWhatsAppJob("sendTemplate", payload);
  }
}

export const whatsappHandlers = {
  sendTemplate,
  pushCustomerIntoQueue,
};
