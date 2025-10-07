"use client";
import { memo } from "react";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import type { IBusinessData } from "@/components/types/businessData";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import {
  BottomBarSkeleton,
  CardSkeleton,
  HeaderSkeleton,
  RewardSkeleton,
} from "@/components/atoms/paymentPageLoader";
import useCouponTemp from "@/components/store/useCouponTemp";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import SplitPayment from "./SplitPayment";

const BillPage = dynamic(() => import("@/components/organisms/cart/billPage"), {
  ssr: false,
  loading: () => <LoadingSpinnerCircle />,
});

const NewPaymentComponent = dynamic(
  () => import("@/components/templates/payment/paymentModes"),
  {
    ssr: false,
    loading: () => <BottomBarSkeleton />,
  },
);

const PaymentBack = dynamic(() => import("../posPayment/paymentBack"), {
  ssr: false,
  loading: () => <HeaderSkeleton />,
});

const PaymentHeader = dynamic(() => import("../payment/paymentHeader"), {
  ssr: false,
  loading: () => <SkeletonLoader height={50} />,
});

const TotalBillButton = dynamic(
  () => import("@/components/templates/newPayment/totalBillButton"),
  {
    ssr: false,
    loading: () => <BottomBarSkeleton />,
  },
);

const ApplyCouponz = dynamic(() => import("../couponz/applyCouponz"), {
  ssr: false,
  loading: () => <RewardSkeleton />,
});

const CoinzRewardSection = dynamic(
  () => import("@/components/templates/payment/coinzRewardSection"),
  {
    ssr: false,
    loading: () => <RewardSkeleton />,
  },
);

const SuggestCouponz = dynamic(() => import("./suggestCouponz"), {
  ssr: false,
  loading: () => <CardSkeleton />,
});

const RefferalCouponz = dynamic(() => import("./refferalCouponz"), {
  ssr: false,
  loading: () => <CardSkeleton />,
});

const ErrorPayment = dynamic(() => import("../payment/errorPay"), {
  ssr: false,
  loading: () => <RewardSkeleton />,
});

const MemoPayLoader = dynamic(() => import("../payment/payLoader"), {
  ssr: false,
  loading: () => <RewardSkeleton />,
});

const CouponzBlink = dynamic(() => import("./couponzBlink"), {
  ssr: false,
  loading: () => <RewardSkeleton />,
});

const AvailableCoinz = dynamic(
  () => import("@/components/templates/payment/availableCoinz"),
  {
    ssr: false,
    loading: () => <RewardSkeleton />,
  },
);

const BillSummary = dynamic(
  () => import("@/components/templates/payment/billSummary"),
  {
    ssr: false,
    loading: () => <CardSkeleton />,
  },
);

const PaymentCard = dynamic(
  () => import("@/components/templates/payment/paymentCard"),
  {
    ssr: false,
    loading: () => <CardSkeleton />,
  },
);

const MemoUnivercelPaymentWithCouponz = ({ data }: { data: IBusinessData }) => {
  const { applyCouponz } = useCouponTemp((s) => ({
    applyCouponz: s.applyCouponz,
  }));
  const isSplitBill = usePaymentStore((state) => state.isBillSplit);
  const { showBillPage } = usePaymentStore();

  const billData = usePaymentStore((state) => state.billData);

  const { isLoading, selectedMode, showError } = usePaymentStore();

  return (
    <main className="relative h-screen bg-black">
      <>
        {isLoading ? (
          <MemoPayLoader selectedMode={selectedMode} />
        ) : showError ? (
          <ErrorPayment />
        ) : applyCouponz ? (
          <ApplyCouponz />
        ) : (
          <>
            {showBillPage ? (
              <BillPage bizData={data} />
            ) : (
              <>
                <section>
                  <PaymentBack data={data} />
                  {selectedMode === "INVOICE" ? <PaymentHeader /> : null}
                </section>
                {selectedMode === "INVOICE" ? (
                  <>
                    <PaymentCard />
                    <CoinzRewardSection />
                    <section className="absolute z-30 w-full mt-10 bg-white rounded-2xl">
                      {/* <CouponzBlink /> */}
                      <RefferalCouponz />
                      <BillSummary />
                      <SuggestCouponz />
                      <TotalBillButton />
                    </section>
                  </>
                ) : (
                  <NewPaymentComponent />
                )}
                <AvailableCoinz />
              </>
            )}
          </>
        )}
      </>
      {isSplitBill && (
        <BottomPopUp
          hide
          height="h-[100dvh]"
          show={isSplitBill}
          onClose={() => usePaymentStore.getState().setIsBillSplit(false)}
        >
          <SplitPayment billData={billData} data={data} />
        </BottomPopUp>
      )}
    </main>
  );
};

const UnivercelPaymentWithCouponz = memo(MemoUnivercelPaymentWithCouponz);
export default UnivercelPaymentWithCouponz;
