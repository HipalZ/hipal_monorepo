"use client";;
import { memo, useCallback, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/components/store/useCart";
import { useCouponz } from "@/components/store/useCouponz";
import { useGetBill } from "@/components/hooks/usePayments";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import CommonBottomButton from "@/components/atoms/bottomButton";
import BillPrint from "@/assets/cart/BillPrint.png";
import KotMachine from "@/assets/cart/KotMachine.png";
import BillImage from "@/assets/call/BillImage.png";
import TransitionImages from "./transitionImages";
import { cn } from "@/components/utils/helpers";
import { HiX } from "react-icons/hi";

const images = [BillPrint, KotMachine, BillImage];

const MemoCartPayment = () => {
  // Store hooks
  const { setCartPage } = useCart();
  const customLink = useParams()?.businessId as string;
  const router = useRouter();

  // Local state
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [displayTimer, setDisplayTimer] = useState(10);
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
    setShowScan,
  } = usePaymentStore();

  // Coupon store hooks
  const { setAvailedCoupon } = useCouponz((s) => ({
    setAvailedCoupon: s.setAvailedCoupon,
  }));

  // Bill query
  const { isLoading, billData, refetch, failureCount, isError, error } = useGetBill();

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

  // Retry function
  const handleRetry = () => {
    refetch();
  };

  // Scan and pay button handler
  const openScanAndPay = useCallback(() => {
    setShowScan(true);
  }, [setShowScan]);

  // Proceed to payment function
  const goBack = useCallback(() => {
    setLoading(true);
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
  ]);

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
    setCartPage("order");
    router.push(`/${customLink}/payment`);
  }

  // Handle different UI states based on billData, errors, and loading

  console.log("billData", billData);
  console.log("isError", isError);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">

      {/* Error state */}
      {isError && error?.status === 400 && failureCount < 1 && (
        <section className="bg-white text-center">
          <h2 className="my-4 text-2xl font-bold">Bill Details</h2>
          <div className="px-4 space-y-4">{/* No data, so no BillItem */}</div>
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
        </section>
      )}

      {/* No bill data - display transition images */}
      {!billData && (
        <center className="mt-24">
          <section className="relative bg-[#8DC1F120] w-[250px] aspect-square rounded-full overflow-hidden">
            <TransitionImages images={images} />
          </section>
          <motion.div
            className="poppins-regular w-full max-w-md text-center my-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold text-[#525252]">Getting your final bill!</h2>
            <p className="text-base mt-2 text-[#52525280]">Hold on while we get your final bill ready.</p>
          </motion.div>
          <div className="poppins-regular my-8 mx-6">
            <button
              type="button"
              onClick={openScanAndPay}
              className={cn("bg-[#008800] text-white border w-full text-base p-4 rounded-xl", {
                "opacity-50 cursor-not-allowed": isButtonDisabled,
              })}
              disabled={isButtonDisabled}
            >
              {isButtonDisabled ? `Scan and pay in ${displayTimer}s` : "Scan and pay"}
            </button>
          </div>
        </center>
      )}
      <button
        type="button"
        onClick={goBack}
        className="absolute bottom-0 p-3 rounded-full bg-[#00000080] text-white transform -translate-x-1/2 -translate-y-1/2 left-1/2"
      >
        <HiX />
      </button>
    </div>
  );
};

const CartPayment = memo(MemoCartPayment);
export default CartPayment;

export const BillItem = ({ icon, label, value, className = "" }) => (
  <div className={`poppins-regular flex items-center justify-between ${className}`}>
    <div className="flex items-center">
      <h3 className="mr-2 text-black text-sm">{icon}</h3>
      <h3 className="text-black text-sm">{label}</h3>
    </div>
    <h3 className="text-black text-sm">{value}</h3>
  </div>
);
