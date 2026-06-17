import { PushNotifications } from "@capacitor/push-notifications";

export type NotificationPermissionStatus = "granted" | "denied" | "prompt";

export class PushNotificationService {
  private listenersInitialized = false;

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
   * Native Android notification channels own push sounds. Do not play Web Audio
   * here, otherwise one foreground push can produce two tones.
   */
  initListeners() {
    if (this.listenersInitialized) return;
    this.listenersInitialized = true;

    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.log("Push notification received:", notification);
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
