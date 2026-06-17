import { BusinessSettings } from "@hi/db-models";

export type NotificationSound = "order" | "alarm";
export type NotificationChannelGroup = "service" | "wakeUp";

const VALID_NOTIFICATION_SOUNDS = new Set<NotificationSound>([
  "order",
  "alarm",
]);

export const DEFAULT_NOTIFICATION_SOUND: NotificationSound = "order";

export const normalizeNotificationSound = (
  sound?: unknown,
): NotificationSound => {
  if (typeof sound !== "string") return DEFAULT_NOTIFICATION_SOUND;

  const normalizedSound = sound.replace(/\.mp3$/i, "");
  return VALID_NOTIFICATION_SOUNDS.has(normalizedSound as NotificationSound)
    ? (normalizedSound as NotificationSound)
    : DEFAULT_NOTIFICATION_SOUND;
};

export const getNotificationChannelId = (
  sound: NotificationSound,
  group: NotificationChannelGroup = "service",
) =>
  group === "wakeUp"
    ? `wake_up_call_${sound}_v1`
    : `service_alerts_${sound}_v1`;

export const resolveBusinessNotificationSound = async (
  businessId?: unknown,
) => {
  if (!businessId) return DEFAULT_NOTIFICATION_SOUND;

  const settings = await BusinessSettings.findOne({
    businessId: businessId.toString(),
  })
    .select("notificationSound")
    .lean();

  return normalizeNotificationSound(settings?.notificationSound);
};

export const resolveBusinessNotificationOptions = async (
  businessId?: unknown,
  group: NotificationChannelGroup = "service",
) => {
  const sound = await resolveBusinessNotificationSound(businessId);
  return {
    sound,
    channelId: getNotificationChannelId(sound, group),
  };
};
