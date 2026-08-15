"use client";

import HotelLogoLoader from "./HotelLogoLoader";

export default function HotelCheckinLoader() {
  return (
    <main
      role="status"
      aria-label="Loading hotel checkin"
      className="relative min-h-dvh w-full overflow-hidden bg-[linear-gradient(135deg,_#FCFCFC_0%,_#F7F2F2_100%)]"
    >
      <div className="mx-auto min-h-dvh w-full max-w-[30rem] bg-gradient-to-br from-[#FEB67640] via-[#FEB67610] to-[#f3ede710] px-3 pb-[5rem] pt-3">
        <div className="opacity-45 blur-[0.5px]">
          <div className="h-[16.25rem] w-full rounded-[1.25rem] bg-[#E7DDD4]" />

          <div className="mt-5 px-1">
            <div className="h-5 w-[38%] rounded-full bg-[#D8CCC1]" />
            <div className="mt-2 h-3 w-[46%] rounded-full bg-[#E4D9CE]" />
          </div>

          <section className="mt-4 grid grid-cols-4 gap-2">
            <div className="h-12 rounded-2xl bg-white shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
            <div className="h-12 rounded-2xl bg-white shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
            <div className="h-12 rounded-2xl bg-white shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
            <div className="h-12 rounded-2xl bg-white shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
          </section>

          <div className="mt-6 h-4 w-[42%] rounded-full bg-[#D8CCC1]" />

          <section className="mt-4 grid grid-cols-2 gap-3">
            <div className="aspect-square rounded-[1.75rem] bg-[#E3D7CB]" />
            <div className="aspect-square rounded-[1.75rem] bg-[#DDD5CD]" />
            <div className="aspect-square rounded-[1.75rem] bg-[#DDD5CD]" />
            <div className="aspect-square rounded-[1.75rem] bg-[#E3D7CB]" />
          </section>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-white/20">
        <HotelLogoLoader ringColorClassName="border-t-[#2563EB]" />
      </div>
    </main>
  );
}
