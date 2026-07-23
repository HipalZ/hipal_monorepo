import {
  DeviceToken,
  HotelServiceTemplateMapping,
  OutLetInfo,
  WhatAppTemplate,
  WhatsAppBusinessConfig,
} from "@hi/db-models";
import axios from "axios";
import { sendPushToTokens } from "../notifications";
import whatsAppApiBaseUrl from "../../utils/whatsAppApiBaseUrl/apiPaths";
import { returnHotelBodyComponents } from "../../routes/hotel/rooms";
import { managersFor } from "./routing";

/**
 * Notifications for checkout tasks. Deliberately a copy of the escalation
 * plumbing rather than an import from `alert.ts` — this module must not be able
 * to affect the guest alert flow, and nothing here writes to a room chat (the
 * guest has already left, and checkout soft-deletes their chat).
 */

/** Push the task to whichever staff currently hold it. */
export const pushToStaff = async (
  businessId: string,
  staffIds: string[],
  roomName: string,
  serviceName: string,
  escalated = false,
): Promise<void> => {
  if (!staffIds.length) return;
  const tokens = await DeviceToken.find({
    businessId,
    userId: { $in: staffIds },
    notification: true,
  });
  if (!tokens.length) return;

  await sendPushToTokens(tokens, {
    title: escalated ? "Room cleaning still unclaimed" : "Room cleaning needed",
    body: escalated
      ? `${roomName} is still waiting for ${serviceName}. Please pick it up.`
      : `${roomName} has checked out and needs ${serviceName}.`,
    // FCM rejects the whole message if any data value is not a string, and the
    // sweeper passes ids straight off a lean document (ObjectId, not string).
    data: {
      type: "HOTEL_CHECKOUT_TASK",
      businessId: String(businessId),
      roomName: String(roomName),
      serviceName: String(serviceName),
    },
  });
};

/**
 * Last rung of the ladder: WhatsApp the managers. Uses the same
 * `service_escalation` template mapping the existing escalation uses, so no new
 * template has to be approved.
 */
export const whatsAppManagers = async (
  businessId: string,
  roomName: string,
  serviceName: string,
  reason: string,
): Promise<void> => {
  const whatsAppConfig = await WhatsAppBusinessConfig.findOne({ businessId });
  if (!whatsAppConfig) return;

  const mapping = await HotelServiceTemplateMapping.findOne({
    businessId,
    serviceName: "service_escalation",
  });
  if (!mapping) return;

  const template = (await WhatAppTemplate.findOne({
    businessId,
    templateId: mapping.templateId,
    isDeleted: false,
  })) as {
    templateName: string;
    bodyVariableSequence: string[];
    languageCode: string;
  } | null;
  if (!template) return;

  const outLetInfo = await OutLetInfo.findOne({ businessId });
  const managers = await managersFor(businessId);
  const url = `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`;

  for (const manager of managers) {
    if (!manager.phone) continue;
    try {
      const components = await returnHotelBodyComponents(
        outLetInfo?.name as string,
        outLetInfo?.address as string,
        template.bodyVariableSequence,
        "roomLink",
        roomName,
        "authCode",
        manager.name || "Manager",
        serviceName,
        manager.name || "Manager",
        "https://chatlink.com",
        outLetInfo?.placeUrl || "googleReviewLink",
        reason,
        manager.phone,
      );

      await axios.post(
        url,
        {
          messaging_product: "whatsapp",
          to: manager.phone.toString(),
          type: "template",
          template: {
            name: template.templateName,
            language: { code: template.languageCode },
            components,
          },
        },
        { headers: { Authorization: `Bearer ${whatsAppConfig.token}` } },
      );
    } catch (error) {
      // One manager's number failing must not stop the rest.
      console.error("[checkoutTask:whatsapp] send failed", error);
    }
  }
};

/** Push managers too — WhatsApp can be slow and is not always configured. */
export const pushToManagers = async (
  businessId: string,
  roomName: string,
  serviceName: string,
): Promise<void> => {
  const managers = await managersFor(businessId);
  if (!managers.length) return;
  const tokens = await DeviceToken.find({
    businessId,
    userId: { $in: managers.map((m) => m._id) },
    notification: true,
  });
  if (!tokens.length) return;

  await sendPushToTokens(tokens, {
    title: "Room cleaning escalated",
    body: `${roomName} — ${serviceName} was not picked up in time.`,
    data: {
      type: "HOTEL_CHECKOUT_TASK_ESCALATION",
      businessId: String(businessId),
      roomName: String(roomName),
      serviceName: String(serviceName),
    },
  });
};
