import { Download, X } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_STORAGE_KEY = 'hitable-install-banner-dismissed';

const InstallAppBanner = memo(function InstallAppBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_STORAGE_KEY) === '1') return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setInstallPrompt(null);
      localStorage.setItem(DISMISS_STORAGE_KEY, '1');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      localStorage.setItem(DISMISS_STORAGE_KEY, '1');
    }

    setVisible(false);
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible || !installPrompt) return null;

  return (
    <div className="fixed left-3 right-3 top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-[9998] mx-auto max-w-md rounded-2xl border border-blue-100 bg-white p-3 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950">Install HiTable</p>
          <p className="mt-0.5 text-xs leading-4 text-slate-500">Get faster access and smoother hotel alerts on this device.</p>
        </div>
        <button type="button" onClick={handleDismiss} className="rounded-full p-2 text-slate-400 active:bg-slate-100" aria-label="Close install banner">
          <X className="h-4 w-4" />
        </button>
      </div>
      <button type="button" onClick={handleInstall} className="mt-3 h-10 w-full rounded-xl bg-blue-500 text-sm font-bold text-white active:bg-blue-600">
        Install app
      </button>
    </div>
  );
});

export default InstallAppBanner;
