import { PushNotifications } from "@capacitor/push-notifications";

export class PushNotificationService {
  // Request permission for push notifications and return token
  async initializePushNotifications(): Promise<string | null> {
    const permission = await PushNotifications.requestPermissions();
    console.log("Push notification permission:", permission);
    if (permission.receive === "granted") {
      PushNotifications.register();

      return new Promise((resolve, reject) => {
        // Listen for registration token
        PushNotifications.addListener("registration", (token) => {
          console.log("Push registration token:", token.value);
          resolve(token.value); // Resolve the promise with the token
        });

        // Handle registration error
        PushNotifications.addListener("registrationError", (error) => {
          console.error("Push registration error:", error);
          alert("Your device is not supported for push notifications.");
          reject(null); // Reject the promise if there's an error
        });
      });
    }
    console.log("Push notification permission denied");
    return null;
  }

  // Other push notification handlers (if needed)
  initListeners() {
    // Listen for push notifications when received
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.log("Push notification received:", notification);
      },
    );

    // Handle push notification action
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        console.log("Push notification action performed:", notification);
      },
    );
  }
}
