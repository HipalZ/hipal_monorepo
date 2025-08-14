import { useMerchantDetails } from "@/components/hooks/useMerchantSecret";
import { useGetBill, useGetOrderId } from "@/components/hooks/usePayments";
import { useUserCoinz } from "@/components/hooks/useUserCoinz";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useCart } from "@/components/store/useCart";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import useTableData from "@/components/store/useTableData";
import type { IBusinessData } from "@/components/types/businessData";
import { cn } from "@/components/utils/helpers";
import { useParams, usePathname, useRouter } from "next/navigation";
import { memo, useCallback, useEffect } from "react";
import { BiArrowBack } from "react-icons/bi";

const MemoPaymentBack = ({ data }: { data: IBusinessData }) => {
  useMerchantDetails();
  // useGetBill();
  useGetOrderId();
  useUserCoinz(data?.loyalty?.loyaltyId || "");
  const pathName = usePathname();
  const { setShowCart } = useCart();
  const setBusinessData = _useAllBusiness((s) => s.setData);
  const { setBusinessDetails } = useBusinessDetails();
  const router = useRouter();
  const customLink = useParams()?.businessId as string;
  const tableName = useTableData((s) => s.tableName);
  const { setLoyaltySetting } = useLoyaltyData();
  const { billValue, setEditBillModal } = usePaymentStore();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);

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

  const { selectedMode, setSelectedMode } = usePaymentStore((s) => ({
    selectedMode: s.selectedMode,
    setSelectedMode: s.setSelectedMode,
  }));

  const handleBack = useCallback(() => {
    switch (selectedMode) {
      case "MODE":
      case "ONLINE":
      case "OFFLINE":
        return setSelectedMode("INVOICE");
      case "INVOICE":
        router.push(`/${customLink}/category?tableName=${tableName}`);
        break;
      default:
        break;
    }
  }, [selectedMode, customLink, router, setSelectedMode]);

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
