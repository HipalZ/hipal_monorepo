"use client"
import BottomPopUp from "@/components/atoms/bottomPopUp";
import GoogleReviewCard from "@/components/atoms/googleReviewCard";
import Image from "next/image";
import React, { memo, useCallback } from "react";
import Sunrays from "@/assets/img/sunrays_white.png";
import { useReview } from "@/components/store/useReview";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter } from "next/navigation";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { flushSync } from "react-dom";

const MemoGReview = () => {
  const customLink = useParams()?.businessId as string;
  const placeUrl = useBusinessDetails((s) => s.businessDetails?.placeUrl);
  const router = useRouter();
  const { showGoogleReview, setShowGoogleReview } = useReview((s) => ({
    showGoogleReview: s.showGoogleReview,
    setShowGoogleReview: s.setShowGoogleReview,
  }));

  const { googleReviewCount } = useLogin((s) => ({
    googleReviewCount: s.googleReviewCount,
  }));

  const skipGreview = useCallback(() => {
    flushSync(() => setShowGoogleReview(false));
    router.push(`/${customLink}/explore`);
  }, [router, customLink, setShowGoogleReview]);

  return (
    <>
      {placeUrl?.length > 0 && googleReviewCount === 0 && showGoogleReview && (
        <BottomPopUp
          show={showGoogleReview}
          onClose={() => setShowGoogleReview(false)}
          hide
        >
          <section className="h-[100dvh] bg-[#e7dfc9] relative overflow-hidden">
            <div className="text-black absolute w-[80%] mx-auto text-3xl !font-semibold text-center transform -translate-x-1/2 left-1/2 top-24 poppins-regular">
              Win More Coinz
            </div>
            <center className="absolute z-0 top-28 -left-16 w-[500px]">
              <Image
                className="opacity-75 animate-spin"
                width={1080}
                height={1080}
                src={Sunrays}
                alt="SunlightReview"
              />
            </center>
            <article className="pt-[14rem]">
              <GoogleReviewCard />
            </article>
            <center
              onClick={skipGreview}
              onKeyDown={skipGreview}
              className="z-20 text-sm text-black underline on_active_bounce underline-offset-2"
            >
              Skip
            </center>
          </section>
        </BottomPopUp>
      )}
    </>
  );
};

const GReview = memo(MemoGReview);
export default GReview;
