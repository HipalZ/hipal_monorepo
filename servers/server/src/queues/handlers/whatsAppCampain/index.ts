import type { Job } from "bullmq";

async function sendMessage(job: Job) {
  const { phone, templateId } = job.data;
  console.log(
    "📲 Sending WhatsApp message:",
    phone,
    "with template:",
    templateId,
  );
  // return await sendWhatsAppMessage(phone, templateId);
}

async function sendCampaign(job: Job) {
  const { contacts, templateId } = job.data;
  for (const phone of contacts) {
    console.log("📲 Sending campaign message to:", phone);
    // await sendWhatsAppMessage(phone, templateId);
  }
  return { processed: contacts.length };
}

export const whatsappHandlers = {
  sendMessage,
  sendCampaign,
};
