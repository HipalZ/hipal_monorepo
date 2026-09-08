"use client";

import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { HOTEL_SESSION_EXPIRED_EVENT } from "@/components/hooks/sessionGuard";

const SessionExpiredBlocker = () => {
  const [mounted, setMounted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setMounted(true);

    const showBlocker = () => setBlocked(true);
    window.addEventListener(HOTEL_SESSION_EXPIRED_EVENT, showBlocker);

    return () => {
      window.removeEventListener(HOTEL_SESSION_EXPIRED_EVENT, showBlocker);
    };
  }, []);

  useEffect(() => {
    if (!blocked) return;

    const previousOverflow = document.body.style.overflow;
    const root = document.getElementById("root");
    const lockedUrl = window.location.href;
    document.body.style.overflow = "hidden";
    root?.setAttribute("inert", "");
    root?.setAttribute("aria-hidden", "true");
    window.history.pushState({ hotelSessionExpired: true }, "", lockedUrl);

    const blockKeyboardAccess = (event: KeyboardEvent) => {
      if (event.key === "Tab" || event.key === "Escape") {
        event.preventDefault();
      }
    };

    const blockBackNavigation = () => {
      window.history.pushState({ hotelSessionExpired: true }, "", lockedUrl);
    };

    window.addEventListener("keydown", blockKeyboardAccess, true);
    window.addEventListener("popstate", blockBackNavigation);

    return () => {
      document.body.style.overflow = previousOverflow;
      root?.removeAttribute("inert");
      root?.removeAttribute("aria-hidden");
      window.removeEventListener("keydown", blockKeyboardAccess, true);
      window.removeEventListener("popstate", blockBackNavigation);
    };
  }, [blocked]);

  if (!mounted || !blocked) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="hotel-session-expired-title"
        aria-describedby="hotel-session-expired-description"
        className="w-full max-w-[22rem] rounded-[24px] bg-white p-6 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2
          id="hotel-session-expired-title"
          className="mt-5 text-[1.35rem] font-extrabold leading-tight text-[#151515]"
        >
          Session expired
        </h2>
        <p
          id="hotel-session-expired-description"
          className="mt-2 text-sm font-semibold leading-6 text-[#5f6673]"
        >
          Please contact frontdesk.
        </p>
      </div>
    </div>,
    document.body,
  );
};

export default memo(SessionExpiredBlocker);
