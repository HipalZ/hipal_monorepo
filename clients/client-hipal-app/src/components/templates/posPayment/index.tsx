"use client";
import { apiRpc } from "@hi/common";
import { BottomBarSkeleton, HeaderSkeleton, RewardSkeleton, CardSkeleton } from "@/components/atoms/paymentPageLoader";
import { getRandomBlurImg } from "@/components/utils/images";
import { memo } from "react";
import { toast } from "react-toastify";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Sunrays from "@/assets/img/sunrays_white.png";
import type { IBusinessData } from "@/components/types/businessData";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useCouponTemp from "@/components/store/useCouponTemp";
import useTableData from "@/components/store/useTableData";

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
    () => import("@/components/templates/payment/newSelectPayment"),
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
    } = usePaymentStore();
    const { setTableName } = useTableData()
    const { businessDetails } = useBusinessDetails();
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
            if (response?.status === 404) {
                toast.error(response?.data?.message || "Something went wrong")
            }
            if (res?.data?.tableName && res?.data?.tableName?.length > 0) {
                setTableName(res?.data?.tableName)
            }
            setBillValue(res.data.total)
            return res.data
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

    console.log("render pos payment")

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
                    <section>
                        <PaymentBack data={data} />
                        {selectedMode === "INVOICE" ? (
                            <center className="pt-2">
                                <p className="mb-2 text-sm font-semibold">Paying:</p>
                                <section className="absolute inset-0 flex items-center justify-center">
                                    <center className="absolute w-[300px] -top-20">
                                        <Image
                                            className="opacity-15"
                                            width={1080}
                                            height={1080}
                                            src={Sunrays}
                                            alt="SunlightReview"
                                        />
                                    </center>
                                </section>
                                <picture className="relative">
                                    <Image
                                        src={businessDetails?.logoUrl}
                                        height={50}
                                        width={50}
                                        quality={95}
                                        objectFit="cover"
                                        alt="logo-businessDetails"
                                        className="object-center bg-white border rounded-full shadow-sm aspect-square"
                                        placeholder="blur"
                                        blurDataURL={getRandomBlurImg(100, 100)}
                                    />
                                </picture>
                                <div
                                    className="relative"
                                    style={{
                                        background:
                                            "linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 1) 50%)",
                                        paddingTop: "50px",
                                    }}
                                >
                                    <p className="relative z-20 -mt-10 text-base font-semibold">
                                        {businessDetails?.name}
                                    </p>
                                </div>
                            </center>
                        ) : null}
                    </section>
                    {selectedMode === "INVOICE" ? (
                        <>
                            <PaymentCard />
                            <CoinzRewardSection />
                            <section className="absolute z-30 w-full mt-10 bg-white rounded-2xl">
                                <CouponzBlink />

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
        </main>
    );
};

const PosPayment = memo(MemoPosPayment)
export default PosPayment
