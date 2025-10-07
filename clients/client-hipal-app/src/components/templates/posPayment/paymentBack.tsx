import { useMerchantDetails } from "@/components/hooks/useMerchantSecret";
import { useGetOrderId } from "@/components/hooks/usePayments";
import { useUserCoinz } from "@/components/hooks/useUserCoinz";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useCart } from "@/components/store/useCart";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import type { IBusinessData } from "@/components/types/businessData";
import { cn } from "@/components/utils/helpers";
import { useParams, usePathname, useRouter } from "next/navigation";
import { memo, useCallback, useEffect } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useOrderStore } from "@/components/store/useOrder";
import { paymentBack } from "@/utils/helper";

const MemoPaymentBack = ({ data }: { data: IBusinessData }) => {
  useMerchantDetails();
  useGetOrderId();
  useUserCoinz(data?.loyalty?.loyaltyId || "");
  const pathName = usePathname();
  const { setShowCart } = useCart();
  const setBusinessData = _useAllBusiness((s) => s.setData);
  const { setBusinessDetails } = useBusinessDetails();
  const clearAll = useOrderStore((s) => s.clearAll);
  const router = useRouter();
  const customLink = useParams()?.businessId || "";
  const { setLoyaltySetting } = useLoyaltyData();
  const { billValue, setEditBillModal } = usePaymentStore();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);

  const selectedMode = usePaymentStore((s) => s.selectedMode);
  const setSelectedMode = usePaymentStore((s) => s.setSelectedMode);

  useEffect(() => {
    setBusinessData(data);
    if (data?.business) {
      setBusinessDetails(data?.business);
    }
    if (data?.loyalty) {
      setLoyaltySetting(data?.loyalty);
    }
    setShowCart(false);
    if (billValue === 0 && outletInfo?.isPosEnabled) {
      setEditBillModal(true);
    }
  }, [
    data,
    setBusinessData,
    setShowCart,
    setBusinessDetails,
    setLoyaltySetting,
    billValue,
    outletInfo,
    setEditBillModal,
  ]);

  const handleLink = useCallback(() => {
    const link = paymentBack(customLink, outletInfo.outLetType);
    router.push(link);
  }, [router, customLink, outletInfo]);

  const handleBack = useCallback(() => {
    switch (selectedMode) {
      case "MODE":
      case "ONLINE":
      case "OFFLINE":
        return setSelectedMode("INVOICE");
      case "INVOICE":
        clearAll()
        handleLink();
        break;
      default:
        break;
    }
  }, [selectedMode, setSelectedMode, clearAll]);

  return (
    <>
      {!(selectedMode === "INVOICE" && pathName?.includes("posPayment")) && (
        <button
          onClick={handleBack}
          onKeyDown={handleBack}
          type="button"
          className={cn(
            selectedMode === "INVOICE"
              ? "bg-[#ffffff70]"
              : "border border-black mt-4",
            "absolute top-2 left-4 py-2 rounded-full z-[60] px-4 text-black",
          )}
        >
          <BiArrowBack />
        </button>
      )}
    </>
  );
};

const PaymentBack = memo(MemoPaymentBack);
export default PaymentBack;
