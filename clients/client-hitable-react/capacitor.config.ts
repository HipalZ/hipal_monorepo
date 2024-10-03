import type { PermCapacitorConfig } from "./permission.config";

const config: PermCapacitorConfig = {
  appId: "hiclient.hipalz.com",
  appName: "HiClientz",
  webDir: "dist",
  server: {
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
