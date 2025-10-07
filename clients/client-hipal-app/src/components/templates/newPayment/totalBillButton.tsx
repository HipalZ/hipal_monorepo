import { useGetBill, useHandleMode } from "@/components/hooks/usePayments";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useLogin } from "@/components/store/useLogin";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { calculateFinalBill } from "@/components/utils/helpers";
import { useUserToken } from "@hi/common/src/useUserToken";
import { Split } from "lucide-react";
import { memo, useCallback } from "react";

const MemoTotalBillButton = () => {
  const claimedCoins = usePaymentStore((s) => s.claimedCoins);
  const claimCouponz = usePaymentStore((s) => s.claimCouponz);
  const tips = usePaymentStore((s) => s.tips);
  const setEditBillModal = usePaymentStore((s) => s.setEditBillModal);
  const billValue = usePaymentStore((s) => s.billValue);
  const billData = usePaymentStore((s) => s.billData);
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);
  const { handleMode } = useHandleMode();
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const setBillData = usePaymentStore((state) => state.setBillData);
  const setSelectedBill = usePaymentStore((state) => state.setSelectedBill);
  const { refetch } = useGetBill();
  const accessToken = useUserToken.getState().accessToken;
  const { setUrlFrom } = useLogin();
  const completeUrl = window.location.href;
  const handleEligibility = useCallback(() => {
    if (billValue === 0) {
      setEditBillModal(true);
    }
    if (!accessToken) {
      setCheckLogin(true);
      setUrlFrom(completeUrl);
    } else {
      handleMode("MODE");
    }
  }, [
    accessToken,
    setCheckLogin,
    handleMode,
    billValue,
    setEditBillModal,
    setUrlFrom,
    completeUrl,
  ]);

  const goToTheSplit = () => {
    setSelectedBill(null);
    setBillData(null);
    setTimeout(() => {
      refetch();
    }, 100);
  };

  return (
    <section
      style={{
        boxShadow: "0px 0px 2px 0px #0000001F",
      }}
      className="fixed bottom-0 !z-[9999] w-full max-w-[30rem] h-16 bg-white flex items-center justify-between px-4 !font-bold text-black"
    >
      <h1 className="text-sm text-left inter">
        Total Bill Amount: {outletInfo?.currencySymbol}{" "}
        {outletInfo?.isPosEnabled
          ? billData?.total?.toFixed(2) || 0
          : calculateFinalBill(billValue, claimedCoins, claimCouponz, tips)}
        <span className="text-xs">
          {claimedCoins > 0 ? (
            <p className="text-[#4CAF50]">
              {claimedCoins} Saved, using{" "}
              {billData?.couponId ? "Couponz" : "Hi-Coinz"}
            </p>
          ) : null}
        </span>
      </h1>
      <section className="flex items-center space-x-4">
        {billData?.variantName ? (
          <article
            onClick={goToTheSplit}
            onKeyDown={goToTheSplit}
            className="bg-black gap-2 flex items-center text-white text-center px-2 py-2 rounded-lg inter text-sm on_active_bounce"
          >
            <Split size={16} />
            <span>Split</span>
          </article>
        ) : null}

        <article
          onClick={handleEligibility}
          onKeyDown={handleEligibility}
          className="bg-black text-white text-center w-[4rem] px-3 py-2 rounded-lg inter text-sm on_active_bounce"
        >
          <span>Pay</span>
        </article>
      </section>
    </section>
  );
};

const TotalBillButton = memo(MemoTotalBillButton);
export default TotalBillButton;
