"use client";
import { apiRpc } from "@hi/common";
import { BottomBarSkeleton, HeaderSkeleton, RewardSkeleton, CardSkeleton } from "@/components/atoms/paymentPageLoader";
import { calculateFinalBill } from "@/components/utils/helpers";
import { getRandomBlurImg } from "@/components/utils/images";
import { type ChangeEvent, memo } from "react";
import { useCallback, useEffect } from "react";
import { useHandleMode, usePayments } from "@/components/hooks/usePayments";
import { useMerchantDetails } from "@/components/hooks/useMerchantSecret";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useQuery } from "@tanstack/react-query";
import { useUserCoinz } from "@/components/hooks/useUserCoinz";
import { useUserToken } from "@hi/common/src/useUserToken";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";
import Image from "next/image";
import Sunrays from "@/assets/img/sunrays_white.png";
import type { IBusinessData } from "@/components/types/businessData";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useCouponTemp from "@/components/store/useCouponTemp";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import useTableData from "@/components/store/useTableData";

const SignUpBonus = dynamic(() => import("@/components/organisms/explore/signupbonus"), {
    ssr: false,
    loading: () => <RewardSkeleton />,
});
const PaymentHeader = dynamic(() => import("./paymentHeader"), {
    ssr: false,
    loading: () => <HeaderSkeleton />,
});
const CombinedLogin = dynamic(() => import("./CombinedLogin"), {
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

const SuggestCouponz = dynamic(() => import("../newPayment/suggestCouponz"), {
    ssr: false,
    loading: () => <CardSkeleton />,
});

const RefferalCouponz = dynamic(() => import("../newPayment/refferalCouponz"), {
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

const CouponzBlink = dynamic(() => import("../newPayment/couponzBlink"), {
    ssr: false,
    loading: () => <RewardSkeleton />,
});

const PaymentComponent = dynamic(
    () => import("@/components/templates/payment/selectPayment"),
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
    const accessToken = useUserToken((s) => s.accessToken);
    const {
        handleCreateOrder
    } = usePayments();
    const router = useRouter();
    const customLink = useParams()?.businessId as string;
    const {
        billValue,
        setBillValue,
        claimedCoinz,
        setClaimedCoinz,
        claimCouponz,
        setTips,
        tips,
        setCustomTip,
        isLoading,
        selectedMode,
        setSelectedMode,
        setSelectedTip,
        setIsTipActive,
        setShowInput,
        setIsModalOpen,
        showError,
        checkLogin,
        setCheckLogin,
        openBlastModal, setOpenBlastModal,
        coinz,
    } = usePaymentStore();
    const { setTableName } = useTableData()
    const { businessDetails } = useBusinessDetails();
    const { handleMode } = useHandleMode()
    const { setLoyaltySetting } = useLoyaltyData();
    const { applyCouponz } = useCouponTemp((s) => ({
        applyCouponz: s.applyCouponz,
    }));

    const { setEditBillModal, editBillModal } = usePaymentStore((s) => ({
        setEditBillModal: s.setEditBillModal,
        editBillModal: s.editBillModal,
    }));
    useMerchantDetails();
    useUserCoinz(data?.loyalty?.loyaltyId || "");

    useEffect(() => {
        if (billValue === 0) {
            setEditBillModal(true);
        }
        setSelectedMode("INVOICE");
        setLoyaltySetting(data?.loyalty);
    }, [data]);

    const clearTheTip = useCallback(() => {
        setTips(0);
        setSelectedTip("");
        setCustomTip("");
        setShowInput(false);
        setIsTipActive(false);
    }, [setTips, setSelectedTip, setCustomTip, setShowInput, setIsTipActive]);

    const handleTipSelect = useCallback(
        (tip: string) => {
            if (tip === "Other") {
                setSelectedTip(tip);
                setShowInput(true);
                setCustomTip("");
                setTips(0);
            } else {
                setSelectedTip(tip);
                setShowInput(false);
                setCustomTip("");
                setTips(Number(tip));
            }
        },
        [setSelectedTip, setShowInput, setCustomTip, setTips],
    );

    const handleCustomTip = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value.replace(/[^0-9.]/g, "");
            setCustomTip(value);
            setTips(Number(value));
        },
        [setCustomTip, setTips],
    );

    const handleSaveTip = useCallback(() => {
        setShowInput(false);
    }, [setShowInput]);

    const handleApplyCoinz = useCallback(
        (finalValue: number) => {
            setClaimedCoinz(finalValue);
            handleCoins(finalValue);
        },
        [setClaimedCoinz],
    );

    const handleCoins = useCallback(async (claimedCoinz: number) => {
        // if has claim coinz then celebrate
        setIsModalOpen(false);
        if (claimedCoinz !== null && claimedCoinz > 0) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });
            let audio: HTMLAudioElement;
            audio = new Audio("/sounds/Money.mp3");
            audio.play();
            return () => {
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            };
        }
    }, [setIsModalOpen]);

    const handleEligibility = useCallback(() => {
        if (billValue === 0) {
            setEditBillModal(true);
        }
        if (!accessToken) {
            setCheckLogin(true);
        } else {
            handleMode("MODE");
        }

    }, [accessToken, setCheckLogin, handleMode, customLink, billValue, setEditBillModal]);

    const goNext = useCallback(() => {
        setOpenBlastModal(false);
        setCheckLogin(true);
        window.location.href = `/${customLink}/posPayment?orderId=${orderId}`
    }, [setOpenBlastModal, setCheckLogin, customLink, orderId]);

    const handleGetOrderId = async () => {
        try {
            const response = await apiRpc.surl.get_table_data[":orderId"].$get({
                param: {
                    orderId: orderId
                }
            })
            const res = await response.json()
            setTableName(res.data.tableName)
            setBillValue(res.data.total)
            return res.data
        } catch (e) {
            console.error(e)
        }
    }

    useQuery({
        queryKey: ["getBusinessDetails", orderId],
        queryFn: handleGetOrderId,
        enabled: !!orderId,
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
                    <section>
                        <PaymentHeader data={data} />
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
                            <PaymentCard
                                offer={claimedCoinz || claimCouponz}
                                logo={data?.business?.logoUrl}
                            />
                            <CoinzRewardSection />
                            <section className="absolute z-30 w-full mt-10 bg-white rounded-2xl">
                                <center className="my-2 text-xl text-black poppins-regular">
                                    Rewardz
                                </center>
                                <CouponzBlink />
                                <RefferalCouponz />
                                <BillSummary
                                    clearTheTip={clearTheTip}
                                    handleTipSelect={handleTipSelect}
                                    handleCustomTip={handleCustomTip}
                                    handleSaveTip={handleSaveTip}
                                />
                                <SuggestCouponz />
                                <section
                                    style={{
                                        boxShadow: "0px 0px 2px 0px #0000001F",
                                    }}
                                    className="fixed bottom-0 w-full max-w-[30rem] h-16 bg-white flex items-center justify-between px-4 !font-bold text-black"
                                >
                                    <h1 className="text-sm text-left inter">
                                        Total Bill Amount: ₹{" "}
                                        {calculateFinalBill(
                                            billValue,
                                            claimedCoinz,
                                            claimCouponz,
                                            tips,
                                        )}
                                        <span className="text-xs">
                                            {claimedCoinz > 0 ? (
                                                <p className="text-[#4CAF50]">
                                                    {claimedCoinz} Saved, using coinz
                                                </p>
                                            ) : null}
                                        </span>
                                    </h1>
                                    <article
                                        onClick={handleEligibility}
                                        onKeyDown={handleEligibility}
                                        className="bg-black text-white px-3 py-2 rounded-lg inter text-sm on_active_bounce"
                                    >
                                        <span>Pay Now</span>
                                    </article>
                                </section>
                            </section>
                        </>
                    ) : (
                        <PaymentComponent
                            handleCreateOrder={handleCreateOrder}
                            total={calculateFinalBill(
                                billValue,
                                claimedCoinz,
                                claimCouponz,
                                tips,
                            )}
                        />
                    )}
                    <AvailableCoinz
                        handleApplyCoinz={handleApplyCoinz}
                        setClaimAmount={data?.loyalty?.setClaimedPercentage}
                    />
                </>
            )}
            <BottomPopUp
                onClose={() => setCheckLogin(false)}
                show={checkLogin}
            >
                <CombinedLogin />
            </BottomPopUp>
            {openBlastModal ?
                <SignUpBonus coinZ={coinz} goNext={goNext} />
                : null}
        </main>
    );
};

const PosPayment = memo(MemoPosPayment)
export default PosPayment
