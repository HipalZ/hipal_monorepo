import { useEffect, useMemo, useRef } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "./clientApp";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { PushNotificationService } from "@/services/fcm/pushNotificationService";
import { useLiteStore } from "@/components/store/useLiteStore";

export const usePushNotifications = () => {
  const { setNotificationStatus } = useLiteStore((s) => ({
    setNotificationStatus: s.setNotificationStatus,
  }));
  const { pushToken, setPushToken, setPlatform } = useHiClientZ((s) => ({
    pushToken: s.pushToken,
    setPushToken: s.setPushToken,
    setPlatform: s.setPlatform,
  }));
  const pushNotificationService = new PushNotificationService();
  const initializedRef = useRef(false);

  const platform = useMemo(() => {
    const isAndroid = () => /Android/i.test(navigator.userAgent);
    return isAndroid() ? "android" : "web";
  }, []);

  const initializePushNotifications = async () => {
    // If already initialized or token exists, return early
    if (initializedRef.current) return;
    setPlatform(platform);
    try {
      if (platform === "android") {
        const token =
          await pushNotificationService.initializePushNotifications();
        console.log("token", token);
        if (token) {
          setPushToken(token);
          pushNotificationService.initListeners();
          console.log("notification status", true);
          setNotificationStatus(true);
        } else {
          setNotificationStatus(false);
          console.log("notification status", false);
        }
      } else {
        const permission = await Notification.requestPermission();
        if (permission === "granted" && "serviceWorker" in navigator) {
          // Register service worker
          await navigator.serviceWorker.register("/firebase-messaging-sw.js");

          const serviceWorkerRegistration = await navigator.serviceWorker.ready;

          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: serviceWorkerRegistration,
          });

          if (token) {
            setPushToken(token);
            setNotificationStatus(true);
          } else {
            setNotificationStatus(false);
          }
        } else {
          setNotificationStatus(false);
        }
      }
      initializedRef.current = true;
    } catch (error) {
      console.error("Error initializing push notifications:", error);
      setNotificationStatus(false);
    }
  };

  return {
    pushTokenInitialize: pushToken,
    initializePushNotifications,
  };
};
