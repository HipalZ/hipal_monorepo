import Image from "next/image";

const ShimmerBlock = ({ className }: { className: string }) => (
  <div className={`hotel-checkin-render-shimmer ${className}`} />
);

export default function HotelCheckinRenderGate({
  logoUrl,
}: {
  logoUrl?: string;
}) {
  return (
    <div className="hotel-checkin-render-gate fixed inset-0 z-[1800] flex justify-center overflow-hidden bg-[linear-gradient(135deg,_#FCFCFC_0%,_#F7F2F2_100%)]">
      <div className="relative min-h-dvh w-full max-w-[30rem] overflow-hidden bg-gradient-to-br from-[#FEB67680] via-[#FEB67610] to-[#f3ede710] px-3 pb-[5rem] pt-3">
        <div className="opacity-75">
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

        <div className="hotel-checkin-render-logo absolute inset-0 flex items-center justify-center bg-white/10">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-[#E8DFD5] bg-white shadow-[0_18px_44px_rgba(68,46,32,0.12)]" />
            <span className="hotel-checkin-render-ring absolute inset-1 rounded-full border-[3px] border-[#EDE5DC] border-t-[#2563EB]" />
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Hotel logo"
                  width={52}
                  height={52}
                  className="h-[52px] w-[52px] object-contain"
                  priority
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hotel-checkin-render-gate {
          pointer-events: none;
          animation: hotelCheckinGateOut 360ms ease forwards;
          animation-delay: 1350ms;
        }

        .hotel-checkin-render-logo {
          opacity: 0;
          animation: hotelCheckinLogoIn 260ms ease forwards;
          animation-delay: 180ms;
        }

        .hotel-checkin-render-ring {
          animation: hotelCheckinRenderSpin 0.9s linear infinite;
        }

        .hotel-checkin-render-shimmer {
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, #e7ddd4 0%, #f7f1ec 48%, #e3d7cb 100%);
          background-size: 220% 100%;
          animation: hotelCheckinRenderShimmer 1.25s ease-in-out infinite;
        }

        @keyframes hotelCheckinLogoIn {
          to {
            opacity: 1;
          }
        }

        @keyframes hotelCheckinGateOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes hotelCheckinRenderSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes hotelCheckinRenderShimmer {
          0% {
            background-position: 120% 0;
          }
          100% {
            background-position: -120% 0;
          }
        }
      `}</style>
    </div>
  );
}
