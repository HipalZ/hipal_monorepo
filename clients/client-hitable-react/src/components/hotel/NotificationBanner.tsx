import { useLiteStore } from '@/components/store/useLiteStore';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { BellOff, BellRing, Settings, X } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

/**
 * Opens the app's notification settings page on Android.
 */
const openNotificationSettings = async () => {
  try {
    const { NativeSettings, AndroidSettings } = await import('capacitor-native-settings');
    await NativeSettings.openAndroid({
      option: AndroidSettings.AppNotification,
    });
  } catch {
    try {
      const { NativeSettings, AndroidSettings } = await import('capacitor-native-settings');
      await NativeSettings.openAndroid({
        option: AndroidSettings.ApplicationDetails,
      });
    } catch {
      console.error('Could not open notification settings');
    }
  }
};

const NotificationBanner = memo(function NotificationBanner() {
  const notificationStatus = useLiteStore((s) => s.notificationStatus);
  const pushToken = useHiClientZ((s) => s.pushToken);
  const { recheckPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Re-check when app comes back to foreground (user might have enabled from settings)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        recheckPermission();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [recheckPermission]);

  if (dismissed) return null;

  // Case 1: Notifications denied — user can fix this
  if (!notificationStatus) {
    return (
      <div className="mx-4 mb-3 overflow-hidden rounded-xl border border-red-200 bg-red-50">
        <div className="flex items-start gap-3 p-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <BellOff className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-800">Notifications are OFF</h4>
            <p className="mt-0.5 text-xs leading-relaxed text-red-700">
              You will not hear alert sounds when guests request service. Turn on notifications so you never miss a request.
            </p>
            <button
              type="button"
              onClick={openNotificationSettings}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white active:bg-red-700"
            >
              <Settings className="h-3.5 w-3.5" />
              Turn ON Notifications
            </button>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 rounded-md p-1 text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Permission granted but no FCM token — device doesn't support push
  // App will use polling fallback with sound — show an info banner (not error)
  if (notificationStatus && !pushToken) {
    return (
      <div className="mx-4 mb-3 overflow-hidden rounded-xl border border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3 p-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
            <BellRing className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-800">Limited notification support</h4>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
              Your device does not fully support push notifications. You will still receive alerts with sound while the app is open. Keep the app open to stay updated.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 rounded-md p-1 text-amber-400 hover:text-amber-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
});

export default NotificationBanner;
