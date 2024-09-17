"use client";
import React from "react";
import { ICouponPage } from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { useParams, useRouter } from "next/navigation";
import type { BusinessDetails, Coupon } from "@/components/types/businessData";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import useCouponTemp from "@/components/store/useCouponTemp";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import LoadingSpinner from "@/components/atoms/progressBar/loadingSpinner";

const Couponz = dynamic(() => import("./singleCoupon"), {
  loading: () => <SkeletonLoader height={200} />,
});
const BirthdayPopup = dynamic(() => import("./occasionPopup"), {
  loading: () => <SkeletonLoader height={200} />,
});
const Congratulationz = dynamic(() => import("./congratulationz"), {
  loading: () => <SkeletonLoader height={200} />,
});

const SeeMyCouponz = dynamic(() => import("./seeMyCouponz"), {
  loading: () => <SkeletonLoader height={200} />,
});

const TermsAndConditions = dynamic(
  () => import("@/components/atoms/termsAndConditions"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const BottomPopUp = dynamic(() => import("@/components/atoms/bottomPopUp"), {
  loading: () => <SkeletonLoader height={200} />,
});

const MainCoupon = ({ data }: { data: BusinessDetails }) => {
  const customLink = useParams()?.businessId as string;
  const { couponId } = useParams();
  const { setBusinessDetails } = useBusinessDetails((s) => ({
    businessDetails: s.businessDetails,
    setBusinessDetails: s.setBusinessDetails,
  }));

  const { openTc, displayTermsAndConditions, isLoading, setIsLoading } =
    useCouponTemp((s) => ({
      openTc: s.openTc,
      displayTermsAndConditions: s.displayTermsAndConditions,
      isLoading: s.isLoading,
      setIsLoading: s.setIsLoading,
    }));
  const router = useRouter();
  const { currentPage, setSelectedCoupon } = useCouponz((s) => ({
    currentPage: s.currentPage,
    setSelectedCoupon: s.setSelectedCoupon,
  }));

  const fetchSingleCouponz = async () => {
    setIsLoading(true);
    try {
      const couponResponse = await apiRpc.couponz[":couponId"].$get({
        param: {
          couponId: couponId as string,
        },
      });
      const coupon = await couponResponse.json();
      setSelectedCoupon(coupon?.data as Coupon);
      setBusinessDetails(data || {});
    } catch (err) {
      console.log("error", err);
      if (couponId === undefined) {
        router.push(`/${customLink}/explore`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useQuery({
    queryKey: ["singleCouponz", customLink, couponId],
    queryFn: fetchSingleCouponz,
    enabled: !!customLink && !!couponId,
  });

  return (
    <>
      {currentPage === ICouponPage.SINGLECOUPON && <Couponz />}
      {currentPage === ICouponPage.BIRTHDAYCOUPON && <BirthdayPopup />}
      {currentPage === ICouponPage.CONGRATULATIONZ && <Congratulationz />}
      {currentPage === ICouponPage.SEEMYCOUPONZ && <SeeMyCouponz />}
      {openTc && (
        <BottomPopUp
          show={openTc}
          onClose={() => displayTermsAndConditions(openTc)}
        >
          <TermsAndConditions />
        </BottomPopUp>
      )}
      {isLoading && <LoadingSpinner />}
    </>
  );
};

export default MainCoupon;
