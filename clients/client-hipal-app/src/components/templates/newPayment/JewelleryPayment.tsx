"use client";

import { memo, useCallback, useEffect, useMemo } from "react";
import { useOrderStore } from "@/components/store/useOrder";
import PaymentBack from "../posPayment/paymentBack";
import { ErrorMessage } from "./ErrorMessage";
import { BillSummary } from "./BillSummary";
import { PaymentFooter } from "./PaymentFooter";
import { NoOrderFound } from "./NoOrderFound";
import { paymentBack } from "@/utils/helper";
import { useRouter, useParams } from "next/navigation";
import { useGetJewelleryOrder } from "../../hooks/useOrderCreate";
import { _useAllBusiness } from "../../store/useAllBusiness";
import LoadingSpinner from "../../atoms/progressBar/loadingSpinner";
import ErrorPanel from "./ErrorComponent";
import type { JewelleryData, JewelleryPayProps } from "./types";
import SuccessPanel from "./SucessPage";
import { useReview } from "../../store/useReview";
// import PaymentSuccess from "../payment/successPay" // (create a small success UI)

const JewelleryPaymentComponent = ({ data }: JewelleryPayProps) => {
  const router = useRouter();
  const customLink = (useParams()?.businessId as string) || "";
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const orderId = useOrderStore((s) => s.orderId);
  const status = useOrderStore((s) => s.status);
  const saveOrderData = useOrderStore((s) => s.saveOrderData);
  const resetForRetry = useOrderStore((s) => s.resetForRetry);
  const clearAll = useOrderStore((s) => s.clearAll);
  const setIsPaymentDone = useReview((s) => s.setIsPaymentDone);
  const { data: order, isLoading, isError } = useGetJewelleryOrder(orderId);

  const handleLink = useCallback(() => {
    router.push(paymentBack(customLink, outletInfo.outLetType));
  }, [router, customLink, outletInfo]);

  const orderData = useMemo<JewelleryData | null>(() => {
    if (!order?.data) return null;
    return order.data as JewelleryData;
  }, [order?.data]);

  const navigateReview = useCallback(() => {
    setIsPaymentDone(true);
    clearAll();
    return router.push(`/${customLink}/review`);
  }, [setIsPaymentDone,
    router, customLink,
    clearAll
  ]);

  useEffect(() => {
    if (order?.data && orderId) {
      saveOrderData(orderId, order.data as JewelleryData);
    }
  }, [order?.data, orderId, saveOrderData]);

  if (!orderId) {
    return (
      <main className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col poppins-regular">
        <PaymentBack data={data} />
        <NoOrderFound onGoBack={handleLink} />
      </main>
    );
  }

  if (status === "FAILED") {
    return (
      <ErrorPanel
        orderId={orderId}
        onTryAgain={() => resetForRetry()}
        onCancel={() => clearAll()}
      />
    );
  }

  if (status === "SUCCESS") {
    return (
      <main className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col poppins-regular">
        <SuccessPanel
          summary={{ orderId, amount: orderData?.total}}
          onGoBack={navigateReview}
          // onDownloadReceipt={() => {}}
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col poppins-regular">
      <PaymentBack data={data} />
      <div className="flex-grow flex items-center justify-center p-4 pt-24 pb-24 overflow-y-auto">
        {isLoading && <LoadingSpinner />}
        {isError && <ErrorMessage />}
        {orderData && <BillSummary orderData={orderData} />}
        {!isLoading && !isError && !orderData && (
          <NoOrderFound onGoBack={handleLink} />
        )}
      </div>
      {orderData && (
        <PaymentFooter
          total={orderData.total ?? 0}
          disabled={isLoading || (orderData.total ?? 0) <= 0}
        />
      )}
    </main>
  );
};

export default memo(JewelleryPaymentComponent);
