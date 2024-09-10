"use client";
import React from "react";
import { ICouponPage } from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import dynamic from "next/dynamic";
import SeeMyCouponz from "./seeMyCouponz";
import type { Coupon } from "@/components/types/businessData";

const Couponz = dynamic(() => import("./singleCoupon"));
const BirthdayPopup = dynamic(() => import("./birthdayPopup"));
const Congratulationz = dynamic(() => import("./congratulationz"));
const TermsAndCondition = dynamic(() => import("./termsAndCondition"));

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
