import { PushNotifications } from "@capacitor/push-notifications";
import { FCM } from "@capacitor-community/fcm";
import { Capacitor } from "@capacitor/core";

export type NotificationPermissionStatus =
  | "granted"
  | "denied"
  | "prompt"
  | "prompt-with-rationale";

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
      let resolveToken!: (token: string) => void;
      let rejectToken!: (error: unknown) => void;
      const tokenPromise = new Promise<string>((resolve, reject) => {
        resolveToken = resolve;
        rejectToken = reject;
      });

      // Register listeners before calling register(). Cached Android tokens can
      // be emitted immediately; attaching listeners afterwards loses the event
      // and leaves pushToken empty forever.
      const registrationHandle = await PushNotifications.addListener(
        "registration",
        async (token) => {
          try {
            if (Capacitor.getPlatform() === "ios") {
              const result = await FCM.getToken();
              resolveToken(result.token);
              return;
            }

            resolveToken(token.value);
          } catch (error) {
            console.error("Unable to obtain the FCM token:", error);
            rejectToken(error);
          }
        },
      );
      const registrationErrorHandle = await PushNotifications.addListener(
        "registrationError",
        (error) => {
          console.error("Push registration error:", error);
          rejectToken(error);
        },
      );

      const timeout = setTimeout(
        () => rejectToken(new Error("Push registration timed out")),
        15000,
      );

      try {
        await PushNotifications.register();
        return await tokenPromise;
      } finally {
        clearTimeout(timeout);
        await registrationHandle.remove();
        await registrationErrorHandle.remove();
      }
    }

    return null;
  }

  /**
   * Set up listeners for incoming push notifications.
   * Native notification channels own push sounds. Do not play Web Audio
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
