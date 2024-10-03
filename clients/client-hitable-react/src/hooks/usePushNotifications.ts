import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "./clientApp";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { PushNotificationService } from "@/services/fcm/pushNotificationService";
import { useCheckPlatform } from "@/components/utils/helpers";

export const usePushNotifications = () => {
  const { pushToken, setPushToken } = useHiClientZ((s) => ({
    pushToken: s.pushToken,
    setPushToken: s.setPushToken,
  }));
  const pushNotificationService = new PushNotificationService();

  const { isAndroid, isWeb } = useCheckPlatform();

  useEffect(() => {
    const initializePushNotifications = async () => {
      if (isAndroid) {
        const token =
          await pushNotificationService.initializePushNotifications();
        setPushToken(token);
      } else if (isWeb) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          if ("serviceWorker" in navigator) {
            const registration = await navigator.serviceWorker.register(
              "/firebase-messaging-sw.js",
            );
            const token = await getToken(messaging, {
              vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
              serviceWorkerRegistration: registration,
            });
            setPushToken(token);
          }
        }
      }
    };

    initializePushNotifications();
  }, [isAndroid, isWeb]);

  return pushToken;
};
