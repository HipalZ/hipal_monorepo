"use client";
import React from "react";
import { ICouponPage } from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import dynamic from "next/dynamic";
import SeeMyCouponz from "./seeMyCouponz";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";

const Couponz = dynamic(() => import("./singleCoupon"), {
  loading: () => <SkeletonLoader height={200} />,
});
const BirthdayPopup = dynamic(() => import("./birthdayPopup"), {
  loading: () => <SkeletonLoader height={200} />,
});
const Congratulationz = dynamic(() => import("./congratulationz"), {
  loading: () => <SkeletonLoader height={200} />,
});
const TermsAndCondition = dynamic(() => import("./termsAndCondition"), {
  loading: () => <SkeletonLoader height={200} />,
});

const MainCoupon = () => {
  const { currentPage } = useCouponz((s) => ({
    currentPage: s.currentPage,
  }));

  return (
    <>
      {currentPage === ICouponPage.SINGLECOUPON && <Couponz />}
      {currentPage === ICouponPage.BIRTHDAYCOUPON && <BirthdayPopup />}
      {currentPage === ICouponPage.CONGRATULATIONZ && <Congratulationz />}
      {currentPage === ICouponPage.TERMSANDCONDITIONS && <TermsAndCondition />}
      {currentPage === ICouponPage.SEEMYCOUPONZ && <SeeMyCouponz />}
    </>
  );
};

export default MainCoupon;
