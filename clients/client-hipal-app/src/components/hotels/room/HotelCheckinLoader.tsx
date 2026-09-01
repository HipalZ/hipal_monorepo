"use client";

import { useEffect, useState } from "react";
import HotelLogoLoader from "./HotelLogoLoader";

const ShimmerBlock = ({ className }: { className: string }) => (
  <div className={`hotel-checkin-shimmer ${className}`} />
);

export default function HotelCheckinLoader() {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLogo(true), 250);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main
      role="status"
      aria-label="Loading hotel checkin"
      className="relative min-h-dvh w-full overflow-hidden bg-[linear-gradient(135deg,_#FCFCFC_0%,_#F7F2F2_100%)]"
    >
      <div
        className="mx-auto min-h-dvh w-full max-w-[30rem] bg-gradient-to-br from-[#FEB67640] via-[#FEB67610] to-[#f3ede710] px-3 pb-[5rem] pt-3"
      >
        <div className="opacity-70">
          <ShimmerBlock className="h-[16.25rem] w-full rounded-[1.25rem]" />

          <div className="mt-5 px-1">
            <ShimmerBlock className="h-5 w-[38%] rounded-full" />
            <ShimmerBlock className="mt-2 h-3 w-[46%] rounded-full" />
          </div>

          <section className="mt-4 grid grid-cols-4 gap-2">
            <ShimmerBlock className="h-12 rounded-2xl shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
            <ShimmerBlock className="h-12 rounded-2xl shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
            <ShimmerBlock className="h-12 rounded-2xl shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
            <ShimmerBlock className="h-12 rounded-2xl shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
          </section>

          <ShimmerBlock className="mt-6 h-4 w-[42%] rounded-full" />

          <section className="mt-4 grid grid-cols-2 gap-3">
            <ShimmerBlock className="aspect-square rounded-[1.75rem]" />
            <ShimmerBlock className="aspect-square rounded-[1.75rem]" />
            <ShimmerBlock className="aspect-square rounded-[1.75rem]" />
            <ShimmerBlock className="aspect-square rounded-[1.75rem]" />
          </section>
        </div>
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-center bg-white/10 transition-opacity duration-300 ${
          showLogo ? "opacity-100" : "opacity-0"
        }`}
      >
        <HotelLogoLoader ringColorClassName="border-t-[#2563EB]" />
      </div>

      <style jsx>{`
        .hotel-checkin-shimmer {
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, #e7ddd4 0%, #f7f1ec 48%, #e3d7cb 100%);
          background-size: 220% 100%;
          animation: hotelCheckinShimmer 1.25s ease-in-out infinite;
        }

        @keyframes hotelCheckinShimmer {
          0% {
            background-position: 120% 0;
          }
          100% {
            background-position: -120% 0;
          }
        }
      `}</style>
    </main>
  );
}
