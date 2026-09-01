"use client";

import Image from "next/image";
import useBusinessDetails from "@/components/store/useBusinessDetails";

interface HotelLogoLoaderProps {
  logoUrl?: string;
  fullscreen?: boolean;
  className?: string;
  ringColorClassName?: string;
}

export default function HotelLogoLoader({
  logoUrl,
  fullscreen = false,
  className = "",
  ringColorClassName = "border-t-[#2563EB]",
}: HotelLogoLoaderProps) {
  const businessLogoUrl = useBusinessDetails(
    (s) => s.businessDetails?.logoUrl
  );

  const source = logoUrl || businessLogoUrl;

  return (
    <div
      className={
        fullscreen
          ? "flex min-h-dvh w-full items-center justify-center bg-[#F8F4EF] px-6 plus-jakarta-font"
          : `flex min-h-[120px] w-full items-center justify-center ${className}`
      }
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-[#E8DFD5] bg-white shadow-[0_18px_44px_rgba(68,46,32,0.12)]" />

        <span
          className={`hotel-logo-loader-ring absolute inset-1 rounded-full border-[3px] border-[#EDE5DC] ${ringColorClassName}`}
        />

        <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white">
          {source ? (
            <Image
              src={source}
              alt="Hotel logo"
              width={52}
              height={52}
              className="h-[52px] w-[52px] object-contain"
              priority
            />
          ) : null}
        </div>
      </div>

      <style jsx>{`
        .hotel-logo-loader-ring {
          animation: hotelLogoLoaderSpin 0.9s linear infinite;
        }

        @keyframes hotelLogoLoaderSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}