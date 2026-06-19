import type { PermCapacitorConfig } from "./permission.config";

const isIosNativeCommand = process.argv.includes("ios");

const config: PermCapacitorConfig = {
  appId: "hiclient.hipalz.com",
  appName: "HiClientz",
  webDir: "dist",
  ...(isIosNativeCommand
    ? {
        // Bundled iOS content uses Capacitor's normal capacitor://localhost origin.
      }
    : {
        server: {
          url: "https://hiclient.hipalz.com",
          androidScheme: "https",
        },
      }),
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
