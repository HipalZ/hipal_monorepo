import { useMemo, useRef, useCallback } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "./clientApp";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { PushNotificationService } from "@/services/fcm/pushNotificationService";
import { useLiteStore } from "@/components/store/useLiteStore";
import { playSelectedNotificationSound } from "@/utils/notificationSound";

const pushNotificationService = new PushNotificationService();

/**
 * Plays a local alert sound as fallback for devices where FCM notification
 * sound doesn't work. Uses the Web Audio API which works in Capacitor webview.
 */
export const usePushNotifications = () => {
  const { setNotificationStatus } = useLiteStore((s) => ({
    setNotificationStatus: s.setNotificationStatus,
  }));
  const { setPushToken, setPlatform } = useHiClientZ((s) => ({
    setPushToken: s.setPushToken,
    setPlatform: s.setPlatform,
  }));
  const initializedRef = useRef(false);

  const platform = useMemo(() => {
    const isAndroid = () => /Android/i.test(navigator.userAgent);
    return isAndroid() ? "android" : "web";
  }, []);

  const initializePushNotifications = async () => {
    if (initializedRef.current) return;
    setPlatform(platform);
    try {
      if (platform === "android") {
        const token =
          await pushNotificationService.initializePushNotifications();
        if (token) {
          setPushToken(token);
          // Pass foreground sound fallback callback
          pushNotificationService.initListeners(() => {
            playSelectedNotificationSound();
          });
          setNotificationStatus(true);
        } else {
          setNotificationStatus(false);
        }
      } else {
        const permission = await Notification.requestPermission();
        if (permission === "granted" && "serviceWorker" in navigator) {
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

  /**
   * Re-check permission status (e.g. after user returns from settings).
   * Updates the store so the NotificationBanner can show/hide accordingly.
   */
  const recheckPermission = useCallback(async () => {
    try {
      if (platform === "android") {
        const status = await pushNotificationService.checkPermissionStatus();
        const granted = status === "granted";
        setNotificationStatus(granted);

        // If now granted and we didn't initialize yet, do it
        if (granted && !initializedRef.current) {
          initializedRef.current = false;
          await initializePushNotifications();
        }
        return granted;
      } else {
        const granted = Notification.permission === "granted";
        setNotificationStatus(granted);
        return granted;
      }
    } catch {
      return false;
    }
  }, [platform, setNotificationStatus]);

  return {
    initializePushNotifications,
    recheckPermission,
    initializedRef,
  };
};
