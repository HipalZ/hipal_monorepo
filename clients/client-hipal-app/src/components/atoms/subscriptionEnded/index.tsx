"use client";

import Image from "next/image";
import { ChevronRight, Headset } from "lucide-react";
import hipalzLogo from "@/assets/hipalz_blue.png";

const SUPPORT_PHONE = "+917702605494";

interface SubscriptionEndedProps {
  businessName?: string;
}

export const isSubscriptionEnded = (
  business?: {
    subscriptionEnded?: boolean | null;
  } | null,
) => business?.subscriptionEnded === true;

export default function SubscriptionEnded({
  businessName,
}: SubscriptionEndedProps) {
  const displayName = businessName?.trim() || "this business";

  return (
    <main
      className="min-h-[100dvh] w-full overflow-y-auto bg-white text-[#111b46]"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      <section className="relative mx-auto flex min-h-[100dvh] w-full max-w-[30rem] flex-col px-5 pb-4 pt-6">
        <header className="relative z-10 flex items-center justify-center">
          <Image
            src={hipalzLogo}
            alt="Hipalz"
            priority
            className="absolute left-0 h-8 w-8"
          />
          <p className="text-[1.28rem] font-bold leading-none text-[#121b49]">
            Hipalz
          </p>
        </header>
        <div className="relative z-10 flex flex-1 flex-col items-center text-center">
          <div className="relative mt-4 flex h-[10.5rem] w-full max-w-[18rem] items-center justify-center">
            <div className="absolute h-[7.7rem] w-[16.5rem] rounded-[50%] bg-[radial-gradient(circle_at_center,_#fff1f1_0%,_#fff6f5_56%,_rgba(255,246,245,0)_76%)]" />
            <span className="absolute left-[2.9rem] top-[4.9rem] h-1.5 w-6 rounded-full bg-[#ffc8c8]" />
            <span className="absolute right-[3.1rem] top-[1.8rem] h-5 w-3 rotate-45 rounded-full bg-[#ffc3c4]" />
            <div className="relative mt-3 h-[7.25rem] w-[9.8rem] overflow-hidden rounded-[1.2rem] bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff6eb_60%,_#fff1e4_100%)] shadow-[0_16px_34px_rgba(20,27,70,0.14),_inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="absolute left-0 top-0 h-[2.65rem] w-full rounded-t-[1.2rem] bg-[linear-gradient(180deg,_#ff6266_0%,_#fb4248_100%)]" />
              <div className="absolute inset-x-0 top-[2.35rem] h-5 bg-[linear-gradient(180deg,_rgba(251,66,72,0.11)_0%,_rgba(255,248,239,0)_100%)]" />
              <div className="absolute bottom-[-1.4rem] left-1/2 h-10 w-24 -translate-x-1/2 rounded-[50%] bg-[#f4dfcc]/55 blur-sm" />
              <div className="absolute left-[1.85rem] top-[-1.18rem] h-[2.55rem] w-[0.82rem] rounded-full bg-[linear-gradient(180deg,_#4b4c59_0%,_#151720_100%)] shadow-lg" />
              <div className="absolute right-[1.85rem] top-[-1.18rem] h-[2.55rem] w-[0.82rem] rounded-full bg-[linear-gradient(180deg,_#4b4c59_0%,_#151720_100%)] shadow-lg" />
              <div className="absolute left-[2.8rem] top-[3.85rem] h-7 w-7 rounded-full text-[1.9rem] font-black leading-6 text-[#2f3038]">
                •
              </div>
              <div className="absolute right-[2.8rem] top-[3.85rem] h-7 w-7 rounded-full text-[1.9rem] font-black leading-6 text-[#2f3038]">
                •
              </div>
              <div className="absolute left-1/2 top-[5.35rem] h-6 w-12 -translate-x-1/2 rounded-t-[50%] border-t-[0.42rem] border-[#30313a]" />
            </div>
          </div>

          <h1 className="mt-6 max-w-[20rem] text-[2rem] font-bold leading-[1.12] text-[#101943]">
            Subscription Has Ended
          </h1>
          <p className="mt-4 max-w-[20rem] text-[1.06rem] font-normal leading-7 text-[#596079]">
            Access for{" "}
            <span className="font-semibold text-[#121b49]">
              "{displayName}"
            </span>{" "}
            is currently paused.
          </p>
          <p className="mt-3 max-w-[20rem] text-[1rem] font-normal leading-7 text-[#6d7287]">
            Please contact your administrator to enable the service and continue.
          </p>
          <p className="mt-3 text-[0.95rem] font-semibold text-[#101943]">
            Thank you 🙏
          </p>

          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="relative z-10 mt-auto flex w-full max-w-[22.5rem] items-center rounded-[1.25rem] border border-[#ffd6d3] bg-[#fffafa] p-3.5 text-left shadow-[0_16px_42px_rgba(250,66,69,0.11)] transition active:scale-[0.99]"
            aria-label="Call administrator for assistance"
          >
            <span className="flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-full bg-[#ffe8e7] text-[#111b46]">
              <Headset className="h-8 w-8" strokeWidth={2.4} />
            </span>
            <span className="ml-3.5 min-w-0 flex-1">
              <span className="block text-[1.1rem] font-semibold leading-tight text-[#101943]">
                Contact administrator
              </span>
            </span>
            <ChevronRight className="ml-2 h-6 w-6 shrink-0 text-[#7a7f8f]" />
          </a>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[7.5rem] overflow-hidden">
          <div className="absolute -bottom-9 left-[-16%] h-[7rem] w-[72%] rotate-[7deg] rounded-[50%] bg-[#ffe0df]" />
          <div className="absolute -bottom-12 right-[-18%] h-[8rem] w-[88%] -rotate-[8deg] rounded-[50%] bg-[#ffd4d1]" />
          <div className="absolute -bottom-16 left-[18%] h-[6.5rem] w-[88%] rounded-[50%] bg-[#ffeceb]" />
        </div>
      </section>
    </main>
  );
}
