"use client";

import { useState, useEffect, useRef } from "react";
import type { BusinessDetails } from "@/components/types/businessData";
import TopBar from "./TopBar";
import Gallery from "./Gallery";
import Footer from "./Footer";
import LeadFormModal from "./LeadFormModal";

interface RealEstateLandingProps {
  businessData: BusinessDetails;
  propertyImages: {
    data: {
      categoryName: string;
      categoryId: string;
      images: {
        _id: string;
        name: string;
        imageUrl: string;
      }[];
    }[];
  };
  userId:string
}

export default function RealEstateLanding({
  businessData,
  propertyImages,
  userId
}: RealEstateLandingProps) {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Helper: schedule a reopen after delay (ms)
  const scheduleOpen = (delayMs: number) => {
    if (typeof window === "undefined") return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const nextAt = Date.now() + delayMs;
    sessionStorage.setItem("leadFormNextAt", String(nextAt));
    timerRef.current = window.setTimeout(() => {
      // double-check user hasn't submitted in the meantime
      if (sessionStorage.getItem("leadFormNeverShow") === "1") return;
      setShowLeadForm(true);
      sessionStorage.removeItem("leadFormNextAt");
    }, delayMs);
  };

  // Initial show logic
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("leadFormNeverShow") === "1") return;

    const nextAtStr = sessionStorage.getItem("leadFormNextAt");
    const now = Date.now();

    // If we already scheduled a future open, honor it; otherwise 5s initial delay
    const initialDelay =
      nextAtStr && Number(nextAtStr) > now ? Number(nextAtStr) - now : 5000;

    scheduleOpen(initialDelay);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called by the modal when it closes
  const handleLeadFormClose = (reason?: "submitted" | "dismissed") => {
    setShowLeadForm(false);

    // Stop any pending timer
    if (timerRef.current) window.clearTimeout(timerRef.current);

    if (reason === "submitted") {
      // user completed the form → don't show again this session
      sessionStorage.setItem("leadFormNeverShow", "1");
      sessionStorage.removeItem("leadFormNextAt");
      return;
    }

    // dismissed (Not now / outside click) → show again in 10s
    scheduleOpen(10_000);
  };

  return (
    <div className="relative min-h-screen overflow-auto pb-[10rem] hide-scrollbar">
      {/* --- Gradient background layer (dark, with soft color glows) --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(1200px circle at 0% 0%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(1000px circle at 100% 100%, rgba(16,185,129,0.14), transparent 60%), linear-gradient(180deg, #0B1020 0%, #111827 100%)",
          backgroundBlendMode: "screen, screen, normal",
        }}
      />
      {/* --- Subtle vignette to darken edges for depth --- */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      <TopBar businessData={businessData} />
      <Gallery propertyImages={propertyImages} />
      <Footer businessData={businessData} />

      <LeadFormModal
        isOpen={showLeadForm}
        onClose={handleLeadFormClose}
        businessId={businessData.businessId}
        userId={userId}
      />
    </div>
  );
}
