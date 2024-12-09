import React, { memo, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter } from "next/navigation";
import useTableData from "@/components/store/useTableData";
import { apiRpc } from "@hi/common";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import {
  FaUser,
  FaPhone,
  FaTable,
  FaReceipt,
  FaPercent,
  FaTags,
  FaMoneyBillWave,
} from "react-icons/fa";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { toast } from "react-toastify";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useCouponz } from "@/components/store/useCouponz";
import { useCart } from "@/components/store/useCart";

interface IBillData {
  customerName: string;
  customerPhone: string;
  tableName: string;
  billRequestId: string;
  subTotal: number;
  serviceCharge: number;
  discount: number;
  tax: number;
  total: number;
}

const MemoCartPayment = () => {
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const userDetails = useLogin((state) => state.userDetails);
  const { tableName } = useTableData();
  const { setShowCart, setCartPage } = useCart();
  const customLink = useParams()?.businessId as string;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

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
    setBillValue,
  } = usePaymentStore();
  const { setAvailedCoupon } = useCouponz((s) => ({
    setAvailedCoupon: s.setAvailedCoupon,
  }));

  const getBill = async () => {
    const response = await apiRpc.pos.get_bill.$get({
      query: {
        businessId: outletInfo?.businessId || "",
        tableName,
        generatedBy: userDetails?.name || "",
      },
    });

    if (response.status === 400) {
      return Promise.reject({
        status: 400,
        message: "Server timeout occurred",
      });
    }

    const res = await response.json();
    const payment = res?.data as IBillData;
    setBillValue(payment.total);
    return payment;
  };

  const {
    isLoading,
    data: billData,
    refetch,
    failureCount,
    isError,
    error,
  } = useQuery({
    queryKey: ["getBill", outletInfo?.businessId, tableName],
    queryFn: getBill,
    staleTime: 1000 * 30,
  });

  const handleRetry = () => {
    refetch();
  };

  const proceedToPayment = useCallback(() => {
    if (billValue === 0) {
      toast.error("Please enter amount");
      return;
    }
    setLoading(true);
    if (billValue > 0) {
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
      setShowCart(false);
      router.push(`/${customLink}/payment`);
    }
  }, [
    billValue,
    customLink,
    router,
    setEditBillModal,
    setClaimCouponz,
    setClaimedCoinz,
    setCustomTip,
    setCartPage,
    setShowCart,
    setTips,
    setSelectedTip,
    setShowInput,
    setIsTipActive,
    setTips,
    setAvailedCoupon,
  ]);

  const totalAttempts = failureCount;

  if (!billData && totalAttempts >= 1) {
    return (
      <div className="mt-4 text-center text-red-500">
        Maximum retry attempts reached. Please try again later.
      </div>
    );
  }

  if (isError && error?.status === 400 && totalAttempts < 1) {
    return (
      <section className="bg-base-100">
        <h2 className="my-4 text-2xl font-bold text-center text-primary">
          Bill Details
        </h2>
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
    );
  }

  if (billData) {
    return (
      <section className="bg-base-100">
        <h2 className="my-4 text-2xl font-bold text-center text-primary">
          Bill Details
        </h2>
        {isLoading || loading ? (
          <LoadingSpinnerCircle />
        ) : (
          <>
            <div className="p-4 mb-6 space-y-3">
              <BillItem
                icon={<FaUser className="text-gray-600" />}
                label="Customer"
                value={billData?.customerName || "Guest"}
              />
              <BillItem
                icon={<FaPhone className="text-gray-600" />}
                label="Phone"
                value={billData?.customerPhone || "N/A"}
              />
              <BillItem
                icon={<FaTable className="text-gray-600" />}
                label="Table"
                value={billData?.tableName || "N/A"}
              />
              <BillItem
                icon={<FaReceipt className="text-gray-600" />}
                label="Bill ID"
                value={billData?.billRequestId || "N/A"}
              />
            </div>
            <hr className="my-4 border-gray-300" />
            <div className="px-4 space-y-2">
              <BillItem
                icon={<FaMoneyBillWave />}
                label="Subtotal"
                value={`₹${billData?.subTotal.toFixed(2)}`}
              />
              <BillItem
                icon={<FaPercent />}
                label="Service Charge"
                value={`₹${billData?.serviceCharge.toFixed(2)}`}
              />
              <BillItem
                icon={<FaTags />}
                label="Discount"
                value={`₹${billData?.discount.toFixed(2)}`}
              />
              <BillItem
                icon={<FaPercent />}
                label="Tax"
                value={`₹${billData?.tax.toFixed(2)}`}
              />
            </div>
            <hr className="my-4 border-gray-300" />
            <BillItem
              icon={<FaMoneyBillWave className="text-green-600" />}
              label="Total"
              value={`₹${billData?.total.toFixed(2)}`}
              className="px-4 text-lg !font-bold"
            />
          </>
        )}
        <CommonBottomButton
          fixed
          buttons={[
            {
              text: "Continue",
              onClick: proceedToPayment,
              type: "button",
              disable: loading,
              isLoading: loading,
            },
          ]}
        />
      </section>
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinnerCircle />
    </div>
  );
};

const BillItem = ({ icon, label, value, className = "" }) => (
  <div className={`flex items-center justify-between ${className}`}>
    <div className="flex items-center">
      <h3 className="mr-2 text-primary">{icon}</h3>
      <h3 className="text-primary">{label}</h3>
    </div>
    <h3 className="text-primary">{value}</h3>
  </div>
);

const CartPayment = memo(MemoCartPayment);
export default CartPayment;
