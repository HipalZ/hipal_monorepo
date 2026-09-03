import {
  AlertTriangle,
  BatteryWarning,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ShieldCheck,
  X,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  type AlertReadinessStatus,
  checkAlertReadiness,
  isNativeAndroid,
  openAlertReadinessSetting,
} from '@/services/alertReadiness/alertReadinessService';

const DISMISS_STORAGE_KEY = 'hitable-alert-readiness-dismissed-at';
const DISMISS_DURATION_MS = 12 * 60 * 60 * 1000;

type ReadinessIssue = {
  id: 'notification' | 'battery' | 'unused-apps';
  title: string;
  description: string;
  actionLabel: string;
  icon: typeof BellRing;
};

const shouldRespectDismissal = () => {
  const dismissedAt = Number(localStorage.getItem(DISMISS_STORAGE_KEY) || 0);
  return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_DURATION_MS;
};

const getReadinessIssues = (status: AlertReadinessStatus | null): ReadinessIssue[] => {
  if (!status) return [];

  const issues: ReadinessIssue[] = [];

  if (!status.notificationEnabled) {
    issues.push({
      id: 'notification',
      title: 'Allow alert notifications',
      description: 'Guest requests need notification permission to ring on this device.',
      actionLabel: 'Enable notifications',
      icon: BellRing,
    });
  }

  if (status.batteryOptimized) {
    issues.push({
      id: 'battery',
      title: 'Allow unrestricted battery use',
      description: 'Battery restrictions can delay alert sounds when the app is in the background.',
      actionLabel: 'Allow battery access',
      icon: BatteryWarning,
    });
  }

  if (status.unusedAppRestrictionsEnabled) {
    issues.push({
      id: 'unused-apps',
      title: 'Turn off pause app activity',
      description: 'This device can pause unused apps and block push alerts after long inactivity.',
      actionLabel: 'Open app activity setting',
      icon: Clock3,
    });
  }

  return issues;
};

const AlertReadinessPrompt = memo(function AlertReadinessPrompt({ enabled }: { enabled: boolean }) {
  const [status, setStatus] = useState<AlertReadinessStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  const issues = useMemo(() => getReadinessIssues(status), [status]);
  const allReady = status ? issues.length === 0 : false;

  const refreshStatus = useCallback(
    async (forceOpen = false) => {
      if (!enabled || !isNativeAndroid()) return;

      setChecking(true);
      const nextStatus = await checkAlertReadiness();
      setStatus(nextStatus);
      setChecking(false);

      const nextIssues = getReadinessIssues(nextStatus);
      if (nextIssues.length > 0 && (forceOpen || !shouldRespectDismissal())) {
        setOpen(true);
      }

      if (nextIssues.length === 0) {
        setOpen(false);
      }
    },
    [enabled],
  );

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshStatus();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [refreshStatus]);

  const handleOpenSetting = async (issue: ReadinessIssue) => {
    try {
      await openAlertReadinessSetting(issue.id);
    } finally {
      await refreshStatus(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    setOpen(false);
  };

  if (!enabled || !isNativeAndroid() || !open || allReady) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/45 px-3 pb-3 backdrop-blur-[2px] sm:items-center sm:p-6">
      <section className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-slate-900/10">
        <div className="bg-slate-950 px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/12">
                <ShieldCheck className="h-6 w-6 text-emerald-200" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Alert setup</p>
                <h2 className="mt-1 text-xl font-bold leading-tight">Keep hotel alerts ringing</h2>
                <p className="mt-1.5 text-sm leading-5 text-slate-300">
                  Complete these device settings so guest requests can reach staff with sound.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-full p-2 text-slate-300 transition active:bg-white/10"
              aria-label="Close alert setup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4">
          {checking ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Checking alert settings...
            </div>
          ) : null}

          {issues.map((issue) => {
            const Icon = issue.icon;
            return (
              <button
                key={issue.id}
                type="button"
                onClick={() => handleOpenSetting(issue)}
                className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-left transition active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-950">{issue.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-600">{issue.description}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-800">
                    {issue.actionLabel}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </button>
            );
          })}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
              <p className="text-xs leading-5 text-slate-600">
                This device does not allow us to change these settings automatically. Tap each item, enable it in Settings, then return here.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refreshStatus(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-bold text-white active:bg-slate-800"
          >
            <CheckCircle2 className="h-4 w-4" />
            I enabled it, check again
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="h-10 w-full rounded-2xl text-sm font-semibold text-slate-500 active:bg-slate-100"
          >
            Remind me later
          </button>
        </div>
      </section>
    </div>
  );
});

export default AlertReadinessPrompt;
