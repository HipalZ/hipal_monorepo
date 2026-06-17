import useBusinessData from "@/components/store/useBusinessData";

export type NotificationSound = "order" | "alarm";

export const normalizeNotificationSound = (
  sound?: unknown,
): NotificationSound => (sound === "alarm" ? "alarm" : "order");

export const getSelectedNotificationSound = () =>
  normalizeNotificationSound(
    useBusinessData.getState().outletInfo?.notificationSound,
  );

export const playSelectedNotificationSound = () => {
  try {
    const sound = getSelectedNotificationSound();
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.volume = 1.0;
    audio.play().catch(() => {});
  } catch {}
};
