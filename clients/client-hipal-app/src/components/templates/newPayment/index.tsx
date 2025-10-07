"use client";
import { memo } from "react";
import type { IBusinessData } from "@/components/types/businessData";
import dynamic from "next/dynamic";
import LoadingSpinnerCircle from "@/components/atoms/loader";

const UnivercelPaymentWithCouponz = dynamic(() => import("./univercelPay"), {
  ssr: false,
  loading: () => <LoadingSpinnerCircle />,
});

const JewelleryPayment = dynamic(() => import("./JewelleryPayment"), {
  ssr: false,
  loading: () => <LoadingSpinnerCircle />,
});

const MemoPaymentWithCouponz = ({ data }: { data: IBusinessData }) => {
  const outLetType = data?.outletInfo.outLetType;

  return (
    <>
      {(outLetType === "RESTAURANT" ||
        outLetType === "MENU" ||
        outLetType === "OTHER") && <UnivercelPaymentWithCouponz data={data} />}
      {(outLetType === "JEWELLERY" || outLetType === "JEWELRY") && (
        <JewelleryPayment data={data} />
      )}
    </>
  );
};

const PaymentWithCouponz = memo(MemoPaymentWithCouponz);
export default PaymentWithCouponz;
