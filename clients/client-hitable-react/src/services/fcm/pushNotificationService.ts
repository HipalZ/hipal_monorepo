import { PushNotifications } from "@capacitor/push-notifications";

export type NotificationPermissionStatus = "granted" | "denied" | "prompt";

export class PushNotificationService {
  /**
   * Check current permission status without prompting the user
   */
  async checkPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      const status = await PushNotifications.checkPermissions();
      return status.receive as NotificationPermissionStatus;
    } catch {
      return "denied";
    }
  }

  /**
   * Request permission and register for push notifications.
   * On Android 13+ this triggers the system permission dialog.
   * On older Android versions, permission is granted by default at install.
   */
  async initializePushNotifications(): Promise<string | null> {
    // First check — if already denied, requestPermissions won't show dialog again
    const currentStatus = await this.checkPermissionStatus();

    if (currentStatus === "denied") {
      // User previously denied — can't re-prompt from code.
      // The NotificationBanner UI will guide them to settings.
      return null;
    }

    const permission = await PushNotifications.requestPermissions();

    if (permission.receive === "granted") {
      PushNotifications.register();

      return new Promise((resolve, reject) => {
        PushNotifications.addListener("registration", (token) => {
          resolve(token.value);
        });

        PushNotifications.addListener("registrationError", (error) => {
          console.error("Push registration error:", error);
          reject(null);
        });
      });
    }

    return null;
  }

  /**
   * Set up listeners for incoming push notifications.
   * The pushNotificationReceived listener fires when the app is in foreground —
   * we play a local sound here as a fallback for devices where FCM sound doesn't work.
   */
  initListeners(onNotificationReceived?: (title: string, body: string) => void) {
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.log("Push notification received:", notification);
        // Callback for foreground sound fallback
        if (onNotificationReceived) {
          onNotificationReceived(
            notification.title || "Alert",
            notification.body || "",
          );
        }
      },
    );

    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        console.log("Push notification action performed:", notification);
      },
    );
  }
}
