"use client";;
import dynamic from "next/dynamic";
import { memo, useCallback, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/components/store/useCart";
import { useCouponz } from "@/components/store/useCouponz";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { HiX } from "react-icons/hi";

const FinalBillLoader = dynamic(() => import("./finalBillLoader"));

const MemoCartPayment = () => {
  // Store hooks
  const { setCartPage } = useCart();
  const customLink = useParams()?.businessId as string;
  const router = useRouter();
  // Local state
  const timerRef = useRef(10);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Payment store hooks
  const {
    billValue,
    setEditBillModal,
    setClaimCouponz,
    setClaimedCoinz,
    setCustomTip,
    setTips,
    setSelectedTip,
    setShowInput,
    setIsTipActive,
    setIsButtonDisabled,
    setDisplayTimer
  } = usePaymentStore();

  // Coupon store hooks
  const { setAvailedCoupon } = useCouponz((s) => ({
    setAvailedCoupon: s.setAvailedCoupon,
  }));

  // Countdown timer for button
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (timerRef.current > 0) {
        timerRef.current -= 1;
        setDisplayTimer(timerRef.current);
      } else {
        setIsButtonDisabled(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // // Retry function
  // const handleRetry = useCallback(() => {
  //   refetch();
  // }, [refetch]);

  // Proceed to payment function
  const goBack = useCallback(() => {
    setEditBillModal(false);
    setClaimCouponz(0);
    setClaimedCoinz(0);
    setSelectedTip("");
    setCustomTip("");
    setShowInput(false);
    setIsTipActive(false);
    setTips(0);
    setAvailedCoupon({});
    setCartPage("order");
    setDisplayTimer(10);
  }, [
    setEditBillModal,
    setClaimCouponz,
    setClaimedCoinz,
    setCustomTip,
    setCartPage,
    setTips,
    setSelectedTip,
    setShowInput,
    setIsTipActive,
    setTips,
    setAvailedCoupon,
    setDisplayTimer,
  ]);

  useEffect(() => {
    if (billValue && billValue > 0) {
      setEditBillModal(false);
      setClaimCouponz(0);
      setClaimedCoinz(0);
      setSelectedTip("");
      setCustomTip("");
      setShowInput(false);
      setIsTipActive(false);
      setTips(0);
      setAvailedCoupon({});
      setCartPage("payment");
      setTimeout(() => {
        router.push(`/${customLink}/payment`);
        setDisplayTimer(10);
      }, 10);
    }
  }, [billValue])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <FinalBillLoader />
      {/* {isError && error?.status === 400 && failureCount < 1 && (
        <CommonBottomButton
          buttons={[
            {
              text: "Retry",
              onClick: handleRetry,
              type: "button",
              disable: loading,
              isLoading: loading,
            },
          ]}
        />
      )} */}
      <button
        type="button"
        onClick={goBack}
        className="absolute bottom-4 p-3 rounded-full bg-[#00000080] text-white transform -translate-x-1/2 -translate-y-1/2 left-1/2"
      >
        <HiX />
      </button>
    </div>
  );
};

const CartPayment = memo(MemoCartPayment);
export default CartPayment;