import { useEffect, useRef } from "react";
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

  const initializedRef = useRef(false);

  useEffect(() => {
    const initializePushNotifications = async () => {
      // If already initialized or token exists, return early
      if (initializedRef.current || pushToken) return;

      try {
        if (isAndroid) {
          const token =
            await pushNotificationService.initializePushNotifications();
          if (token) {
            setPushToken(token);
          }
        } else if (isWeb) {
          const permission = await Notification.requestPermission();
          if (permission === "granted" && "serviceWorker" in navigator) {
            // Register service worker
            await navigator.serviceWorker.register("/firebase-messaging-sw.js");

            const serviceWorkerRegistration =
              await navigator.serviceWorker.ready;

            const token = await getToken(messaging, {
              vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
              serviceWorkerRegistration: serviceWorkerRegistration,
            });

            if (token) {
              setPushToken(token); // Ensure push token is set
            }
          }
        }
        initializedRef.current = true; // Mark as initialized to prevent re-triggering
      } catch (error) {
        console.error("Error initializing push notifications:", error);
      }
    };

    initializePushNotifications();
  }, [isAndroid, isWeb, setPushToken, pushToken]); // Ensure pushToken is added to the dependency array

  return pushToken;
};
