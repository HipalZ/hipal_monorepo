"use client";
import React, { useEffect } from "react";
import { ICouponPage } from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import dynamic from "next/dynamic";
import SeeMyCouponz from "./seeMyCouponz";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { useParams, useRouter } from "next/navigation";

const Couponz = dynamic(() => import("./singleCoupon"), {
  loading: () => <SkeletonLoader height={200} />,
});
const BirthdayPopup = dynamic(() => import("./occasionPopup"), {
  loading: () => <SkeletonLoader height={200} />,
});
const Congratulationz = dynamic(() => import("./congratulationz"), {
  loading: () => <SkeletonLoader height={200} />,
});

const MainCoupon = () => {
  const customLink = useParams()?.businessId as string;
  const router = useRouter();
  const { currentPage, selectedCoupon } = useCouponz((s) => ({
    currentPage: s.currentPage,
    selectedCoupon: s.selectedCoupon,
  }));
  useEffect(() => {
    if (Object.keys(selectedCoupon).length === 0) {
      router.push(`/${customLink}/explore`);
    }
  }, [selectedCoupon]);

  return (
    <>
      {currentPage === ICouponPage.SINGLECOUPON && <Couponz />}
      {currentPage === ICouponPage.BIRTHDAYCOUPON && <BirthdayPopup />}
      {currentPage === ICouponPage.CONGRATULATIONZ && <Congratulationz />}
      {currentPage === ICouponPage.SEEMYCOUPONZ && <SeeMyCouponz />}
    </>
  );
};

export default MainCoupon;
