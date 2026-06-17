export const playSelectedNotificationSound = () => {
  try {
    const audio = new Audio("/sounds/order.mp3");
    audio.volume = 1.0;
    audio.play().catch(() => {});
  } catch {}
};
