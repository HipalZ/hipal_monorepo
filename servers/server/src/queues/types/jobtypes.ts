// src/types/jobTypes.ts

import { QUEUE_NAME } from "../constants/queueNames";

export type BillJobTypes = {
  requestOnly: { payload: { orderId: string } };
  requestAndSettle: { payload: { total: number } };
};

export type WhatsAppJobTypes = {
  sendMessage: { phone: string; templateId: string };
  sendCampaign: { contacts: string[]; templateId: string };
};

export type JobMap = {
  [QUEUE_NAME.BILL_QUEUE]: BillJobTypes;
  [QUEUE_NAME.WHATSAPP_CAMPAIGN_QUEUE]: WhatsAppJobTypes;
};
