import { Download, Share2, X } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "hitable-pwa-install-dismissed";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true);

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const InstallAppBanner = memo(function InstallAppBanner() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "true",
  );
  const [installed, setInstalled] = useState(() => isStandalone());
  const showIosHint = useMemo(() => isIos() && !installed, [installed]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/firebase-messaging-sw.js").catch(() => {
        // Push setup will surface permission/token issues separately.
      });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  if (dismissed || installed || (!installPrompt && !showIosHint)) {
    return null;
  }

  return (
    <div className="sticky top-0 z-[60] border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-[30rem] items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-white">
          {showIosHint ? <Share2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950">Install HiTable</p>
          <p className="text-xs leading-5 text-slate-600">
            {showIosHint
              ? "Tap Share, then Add to Home Screen."
              : "Open as an app and receive staff alerts faster."}
          </p>
        </div>
        {installPrompt ? (
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white active:scale-95"
          >
            Install
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-md p-1 text-slate-400 hover:text-slate-700"
          aria-label="Dismiss install banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

export default InstallAppBanner;
