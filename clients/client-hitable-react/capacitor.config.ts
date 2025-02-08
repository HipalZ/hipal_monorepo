import type { PermCapacitorConfig } from "./permission.config";

const config: PermCapacitorConfig = {
  appId: "table.test.hipalz.com",
  appName: "hitable-test",
  webDir: "dist",
  server: {
    url: "https://table.test.hipalz.com",
    androidScheme: "https",
  },
  android: {
    permissions: ["android.permission.CAMERA"],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
