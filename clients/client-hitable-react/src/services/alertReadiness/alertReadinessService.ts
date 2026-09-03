import { Capacitor, registerPlugin } from '@capacitor/core';

export type AlertReadinessStatus = {
  notificationEnabled: boolean;
  batteryOptimized: boolean;
  unusedAppRestrictionsEnabled: boolean;
  unusedAppRestrictionsStatus: 'disabled' | 'unavailable' | 'enabled_api_30_backport' | 'enabled_api_30' | 'enabled_api_31' | 'unknown';
};

type AlertReadinessPlugin = {
  check: () => Promise<AlertReadinessStatus>;
  openNotificationSettings: () => Promise<{ opened: boolean }>;
  openBatteryOptimizationSettings: () => Promise<{ opened: boolean }>;
  openUnusedAppRestrictionsSettings: () => Promise<{ opened: boolean }>;
};

const AlertReadiness = registerPlugin<AlertReadinessPlugin>('AlertReadiness');

export const isNativeAndroid = () => Capacitor.getPlatform() === 'android' && Capacitor.isNativePlatform();

export const checkAlertReadiness = async (): Promise<AlertReadinessStatus | null> => {
  if (!isNativeAndroid()) return null;

  try {
    return await AlertReadiness.check();
  } catch (error) {
    console.warn('Alert readiness check is unavailable in this native build.', error);
    return null;
  }
};

export const openAlertReadinessSetting = async (setting: 'notification' | 'battery' | 'unused-apps') => {
  if (!isNativeAndroid()) return;

  if (setting === 'notification') {
    await AlertReadiness.openNotificationSettings();
    return;
  }

  if (setting === 'battery') {
    await AlertReadiness.openBatteryOptimizationSettings();
    return;
  }

  await AlertReadiness.openUnusedAppRestrictionsSettings();
};
