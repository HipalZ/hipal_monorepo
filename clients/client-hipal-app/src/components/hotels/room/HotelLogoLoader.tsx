"use client";

import Image from "next/image";
import hipalLoader from "@/assets/hipalLoader.png";
import useBusinessDetails from "@/components/store/useBusinessDetails";

interface HotelLogoLoaderProps {
  logoUrl?: string;
  fullscreen?: boolean;
}

export default function HotelLogoLoader({
  logoUrl,
  fullscreen = false,
}: HotelLogoLoaderProps) {
  const businessLogoUrl = useBusinessDetails((s) => s.businessDetails?.logoUrl);
  const source = logoUrl || businessLogoUrl || hipalLoader;

  return (
    <div
      className={
        fullscreen
          ? "flex min-h-dvh w-full items-center justify-center bg-[#F8F4EF] px-6 plus-jakarta-font"
          : "flex min-h-[120px] w-full items-center justify-center"
      }
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/90 shadow-[0_16px_40px_rgba(68,46,32,0.10)] ring-1 ring-black/5">
        <Image
          src={source}
          alt="Hotel logo"
          width={52}
          height={52}
          className="h-[52px] w-[52px] rounded-2xl object-contain"
          priority
        />
      </div>
    </div>
  );
}
