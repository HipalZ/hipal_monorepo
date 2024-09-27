"use client";
import { useReview } from "@/components/store/useReview";
import React, { memo } from "react";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/atoms/progressBar/loadingSpinner";

const PayOnlineSuccess = dynamic(() => import("./paySuccess"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const ReviewPage = dynamic(() => import("."), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const MemoMainReviewPage = () => {
  const { isPaymentDone } = useReview((s) => ({
    isPaymentDone: s.isPaymentDone,
  }));
  return <>{isPaymentDone ? <ReviewPage /> : <PayOnlineSuccess />}</>;
};

const MainReviewPage = memo(MemoMainReviewPage);
export default MainReviewPage;
