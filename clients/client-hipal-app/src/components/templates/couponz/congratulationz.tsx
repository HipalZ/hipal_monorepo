"use client";
import React, { memo, useCallback, useEffect } from "react";
import { BiArrowBack } from "react-icons/bi";
import {
  cn,
  ICouponPage,
  triggerConfettiBlast,
} from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import { useParams, useRouter } from "next/navigation";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";

const CouponCardCongrats = dynamic(
  () => import("@/components/atoms/couponCardCongrats"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const MemoCongratulationz = () => {
  const router = useRouter();
  const customLink = useParams()?.businessId;
  const { billValue } = usePaymentStore((s) => ({
    billValue: s.billValue,
  }));
  const { setCurrentPage, currentPage, selectedCoupon, direction } = useCouponz(
    (s) => ({
      currentPage: s.currentPage,
      setCurrentPage: s.setCurrentPage,
      selectedCoupon: s.selectedCoupon,
      direction: s.direction,
    }),
  );

  useEffect(() => {
    triggerConfettiBlast();
  }, [currentPage]);

  const handleBack = useCallback(() => {
    setCurrentPage(ICouponPage.SINGLECOUPON);
  }, [currentPage]);

  const handleSeeAllCouponz = useCallback(() => {
    if (direction === "payment") {
      router.push(`/${customLink}/payment?amount=${billValue}`);
    }
    setCurrentPage(ICouponPage.SEEMYCOUPONZ);
  }, [currentPage, direction]);

  return (
    <main
      className={cn(
        `bg-[${selectedCoupon?.bgColour || "#9267EC"}]`,
        `text-[${selectedCoupon?.bgColour || "#9267EC"}]`,
        "h-[100vh] relative z-50 max-w-[30rem] overflow-hidden",
      )}
    >
      <button
        onClick={handleBack}
        type="button"
        className="top-4 left-4 py-2 rounded-full absolute z-[60] px-4 text-black bg-[#ffffff70]"
      >
        <BiArrowBack />
      </button>
      <section
        className={cn(
          `text-[${selectedCoupon?.bgColour || "#9267EC"}]`,
          "absolute inset-0 custom-top-congratulationz space-grotesk-700",
        )}
      >
        <svg title="Curve" viewBox="0 0 500 500">
          <path
            id="curve"
            fill="transparent"
            d="M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97"
          />
          <text width="500">
            <textPath
              xlinkHref="#curve"
              startOffset="52%"
              textAnchor="middle"
              style={{
                fontSize: "36px",
                letterSpacing: "0.1em",
              }}
            >
              Congratulationz !
            </textPath>
          </text>
        </svg>
      </section>
      <CouponCardCongrats />
      <section className="absolute inset-0 flex items-center justify-center rotate-12">
        <center className="relative z-50 w-64 shadow-2xl rounded-xl">
          <div className="rounded-t-xl w-[16rem] h-[11rem] bg-[#FCC13D]" />
          <div className="relative min-h-[7rem] max-h-full z-10 bg-[#FCC13D] rounded-2xl shadow-2xl" />
        </center>
      </section>
      <section className="absolute inset-0 flex items-center justify-center -rotate-12">
        <center className="relative z-50 w-64 shadow-2xl rounded-xl">
          <div className="rounded-t-xl w-[16rem] h-[11rem] bg-[#C8AAEE] shadow-2xl" />
          <div className="relative min-h-[7rem] max-h-full z-10 bg-[#C8AAEE] rounded-2xl shadow-2xl" />
        </center>
      </section>
      <center
        className={cn(
          `text-[${selectedCoupon?.bgColour || "#9267EC"}]`,
          "absolute text-black text-2xl transform -translate-x-1/2 custom-bottom-congratulationz left-1/2 w-full",
        )}
      >
        You have won !!!
      </center>
      <button
        type="button"
        onClick={handleSeeAllCouponz}
        className="bg-black bottom_btn py-2"
      >
        See All Couponz
      </button>
    </main>
  );
};

const Congratulationz = memo(MemoCongratulationz);
export default Congratulationz;
