"use client";
import { apiRpc } from "@hi/common";
import { BottomBarSkeleton, HeaderSkeleton, RewardSkeleton, CardSkeleton } from "@/components/atoms/paymentPageLoader";
import { memo } from "react";
import { toast } from "react-toastify";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { BillData, IBusinessData } from "@/components/types/businessData";
import useCouponTemp from "@/components/store/useCouponTemp";
import useTableData from "@/components/store/useTableData";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import LoadingSpinnerCircle from "@/components/atoms/loader";

const PaymentHeader = dynamic(() => import("../payment/paymentHeader"), {
    ssr: false,
    loading: () => <SkeletonLoader height={50} />,
});
const BillPage = dynamic(() => import("@/components/organisms/cart/billPage"), {
    ssr: false,
    loading: () => <LoadingSpinnerCircle />,
});

const TotalBillButton = dynamic(() => import("@/components/templates/newPayment/totalBillButton"), {
    ssr: false,
    loading: () => <BottomBarSkeleton />,
});

const PaymentBack = dynamic(() => import("./paymentBack"), {
    ssr: false,
    loading: () => <HeaderSkeleton />,
});

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

const SuggestCouponz = dynamic(() => import("@/components/templates/newPayment/suggestCouponz"), {
    ssr: false,
    loading: () => <CardSkeleton />,
});

const RefferalCouponz = dynamic(() => import("@/components/templates/newPayment/refferalCouponz"), {
    ssr: false,
    loading: () => <CardSkeleton />,
});

const ErrorPayment = dynamic(() => import("@/components/templates/payment/errorPay"), {
    ssr: false,
    loading: () => <RewardSkeleton />,
});

const MemoPayLoader = dynamic(() => import("@/components/templates/payment/payLoader"), {
    ssr: false,
    loading: () => <RewardSkeleton />,
});

const CouponzBlink = dynamic(() => import("@/components/templates/newPayment/couponzBlink"), {
    ssr: false,
    loading: () => <RewardSkeleton />,
});

const NewPaymentComponent = dynamic(
    () => import("@/components/templates/payment/paymentModes"),
    {
        ssr: false,
        loading: () => <BottomBarSkeleton />,
    },
);

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

const MemoPosPayment = ({ data }: { data: IBusinessData }) => {
    const orderId = useSearchParams().get("orderId") as string;
    const {
        setBillValue,
        isLoading,
        selectedMode,
        showError,
        showBillPage,
        setBillData,
        setClaimedCoinz,
        setSelectedTip
    } = usePaymentStore();

    const { setTableName } = useTableData()
    const { applyCouponz } = useCouponTemp((s) => ({
        applyCouponz: s.applyCouponz,
    }));

    const handleGetOrderId = async () => {
        try {
            const response = await apiRpc.surl.get_table_data[":orderId"].$get({
                param: {
                    orderId: orderId
                }
            })
            const res = await response.json()
            const payment = res.data as BillData
            if (response?.status === 404) {
                toast.error(response?.data?.message || "Something went wrong")
            }
            if (payment?.tableName && payment?.tableName?.length > 0) {
                setTableName(payment?.tableName)
            }
            setBillValue(payment.total)
            setBillData(payment)
            setClaimedCoinz(payment?.claimedCoins);
            setSelectedTip(payment?.tips?.toString() || "");
            return payment
        } catch (e) {
            console.error(e)
        }
    }

    useQuery({
        queryKey: ["getBusinessDetails", orderId],
        queryFn: handleGetOrderId,
        enabled: orderId !== null,
        staleTime: 1000 * 60 * 5,
    })

    return (
        <main className="relative h-screen bg-black">
            {isLoading ? (
                <MemoPayLoader selectedMode={selectedMode} />
            ) : showError ? (
                <ErrorPayment />
            ) : applyCouponz ? (
                <ApplyCouponz />
            ) : (
                <>
                    {showBillPage ? <BillPage /> :
                        <div>
                            <section>
                                <PaymentBack data={data} />
                                {selectedMode === "INVOICE" ? (
                                    <PaymentHeader />
                                ) : null}
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
                        </div>
                    }
                </>
            )}
        </main>
    );
};

const PosPayment = memo(MemoPosPayment)
export default PosPayment
