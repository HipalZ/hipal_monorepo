"use client";
import { memo } from "react";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { toast } from "react-toastify";
import { useCallback, useEffect } from "react";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter } from "next/navigation";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import confetti from "canvas-confetti";
import type { IBusinessData } from "@/components/types/businessData";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import usePayment from "@/components/store/usePayment";
import useTableData, { resetTableData } from "@/components/store/useTableData";
import {
  calculateFinalBill,
  calculateReward,
  cn,
  type PageStates,
} from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import { BiArrowBack } from "react-icons/bi";
import { getRandomBlurImg } from "@/components/utils/images";
import { useCart } from "@/components/store/useCart";
import { useCouponz } from "@/components/store/useCouponz";
import { useErrorHandling } from "@/utils/helper";
import { useMerchantDetails } from "@/components/hooks/useMerchantSecret";
import { useUserCoinz } from "@/components/hooks/useUserCoinz";
import dynamic from "next/dynamic";
import Image from "next/image";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import Sunrays from "@/assets/img/sunrays_white.png";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useCouponTemp from "@/components/store/useCouponTemp";

const BillPage = dynamic(() => import("@/components/organisms/cart/billPage"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const BottomPopUp = dynamic(() => import("@/components/atoms/bottomPopUp"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});
const NewPaymentComponent = dynamic(
  () => import("@/components/templates/payment/newSelectPayment"),
  {
    ssr: false,
    loading: () => <BottomBarSkeleton />,
  },
);

import { BottomBarSkeleton } from "@/components/atoms/paymentPageLoader";
import PaymentBack from "../posPayment/paymentBack";

const TotalBillButton = dynamic(() => import("@/components/templates/newPayment/totalBillButton"), {
  ssr: false,
  loading: () => <BottomBarSkeleton />,
});

const ApplyCouponz = dynamic(() => import("../couponz/applyCouponz"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const CoinzRewardSection = dynamic(
  () => import("@/components/templates/payment/coinzRewardSection"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={50} />,
  },
);

const SuggestCouponz = dynamic(() => import("./suggestCouponz"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const RefferalCouponz = dynamic(() => import("./refferalCouponz"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const ErrorPayment = dynamic(() => import("../payment/errorPay"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const MemoPayLoader = dynamic(() => import("../payment/payLoader"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const CouponzBlink = dynamic(() => import("./couponzBlink"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const PaymentComponent = dynamic(
  () => import("@/components/templates/payment/selectPayment"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  },
);

const AvailableCoinz = dynamic(
  () => import("@/components/templates/payment/availableCoinz"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={250} />,
  },
);

const BillSummary = dynamic(
  () => import("@/components/templates/payment/billSummary"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  },
);

const PaymentCard = dynamic(
  () => import("@/components/templates/payment/paymentCard"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  },
);

const MemoPaymentWithCouponz = ({ data }: { data: IBusinessData }) => {
  const customLink = useParams()?.businessId as string;
  const { errorText } = useErrorHandling();
  const businessId = data?.business?.businessId;
  const { setLoyaltySetting } = useLoyaltyData();
  const { userDetails } = useLogin((s) => ({ userDetails: s.userDetails }));
  const { availedCoupon, channelId, setChannelId } = useCouponz((s) => ({
    availedCoupon: s.availedCoupon,
    channelId: s.channelId,
    setChannelId: s.setChannelId,
  }));
  const { applyCouponz } = useCouponTemp((s) => ({
    applyCouponz: s.applyCouponz,
  }));

  const { setEditBillModal, showBillPage, setShowBillPage, billData } = usePaymentStore();

  const { setShowCart } = useCart();
  useMerchantDetails();
  useUserCoinz(data?.loyalty?.loyaltyId || "");
  useEffect(() => {
    if (billValue === 0) {
      setEditBillModal(true);
    }
    setShowCart(false);
    setLoyaltySetting(data?.loyalty);
  }, [data]);

  const {
    billValue,
    userCoinz,
    claimedCoinz,
    setClaimedCoinz,
    claimCouponz,
    setTips,
    tips,
    customTip,
    setCustomTip,
    isLoading,
    setIsLoading,
    selectedMode,
    setSelectedMode,
    setSelectedTip,
    setIsTipActive,
    showInput,
    setShowInput,
    setIsModalOpen,
    merchantDetails,
    showError,
    setShowError,
    setShowScan,
  } = usePaymentStore();

  const { businessDetails } = useBusinessDetails();
  const { tableName, setTableName } = useTableData();
  const router = useRouter();
  const { loyaltySetting } = useLoyaltyData();

  const { setRazorPayPaymentId, setRazorPayOrderId, setRazorPaySignature } =
    usePayment();

  // hoisting for adding dep in next callback
  const sendPaymentResponse = useCallback(
    async (response: any) => {
      setIsLoading(true);
      const total = calculateFinalBill(
        billValue,
        claimedCoinz,
        claimCouponz,
        tips,
      );
      const res = await apiRpc.payments.validPayment[":merchantId"].$post({
        param: {
          merchantId: merchantDetails.razorpayMerchantId,
        },
        json: {
          response,
        },
        query: {
          couponId: availedCoupon?._id,
          userId: userDetails?._id,
          paidAmount: total?.toString(),
          tableName: tableName,
          businessId: businessId,
        },
      });
      if (!res.ok) {
        return errorText(res.status);
      }
      const data = await res.json();
      const orderId = data?.data as string;

      const coinsObtained =
        total * (loyaltySetting?.setCashBackPercentage / 100);
      const existingCoins = claimedCoinz ? userCoinz - claimedCoinz : userCoinz;
      let finalReward = 0;
      if (
        (availedCoupon?.cashbackAvailable && claimCouponz > 0) ||
        claimedCoinz > 0 ||
        (claimedCoinz === 0 && claimCouponz === 0)
      ) {
        finalReward = calculateReward(
          existingCoins,
          coinsObtained,
          loyaltySetting?.rewardLimit,
        )?.finalReward;
      }

      if (res.status === 200) {
        toast.success("Payment successful");
        setRazorPaySignature("");
        setRazorPayOrderId("");
        setRazorPayPaymentId("");
        resetTableData();
        setChannelId("");
        setIsLoading(false);
        return router.push(
          `/${customLink}/review?amount=${total}&mode=online&claim=${Math.round(
            finalReward,
          )}&orderId=${orderId}`,
        );
      }
      toast.error("Payment failed");
    },
    [
      setIsLoading,
      apiRpc,
      merchantDetails.razorpayMerchantId,
      availedCoupon?._id,
      userDetails?._id,
      billValue,
      claimedCoinz,
      claimCouponz,
      tips,
      loyaltySetting?.setCashBackPercentage,
      loyaltySetting?.rewardLimit,
      userCoinz,
      setRazorPaySignature,
      setRazorPayOrderId,
      setRazorPayPaymentId,
      setTableName,
      router,
      customLink,
    ],
  );

  const handlePaymentSuccess = useCallback(
    async (response: any) => {
      setIsLoading(true);
      await sendPaymentResponse(response);
      setRazorPaySignature(response.razorpay_signature);
      setRazorPayOrderId(response.razorpay_order_id);
      setRazorPayPaymentId(response.razorpay_payment_id);
    },
    [
      setIsLoading,
      setRazorPaySignature,
      setRazorPayOrderId,
      setRazorPayPaymentId,
      sendPaymentResponse,
    ],
  );

  const handlePaymentDismiss = useCallback(() => {
    setRazorPaySignature("");
    setRazorPayOrderId("");
    setRazorPayPaymentId("");
    setShowError(true);
    toast.error("Payment failed");
    setTimeout(() => {
      setShowError(false);
    }, 2000);
  }, [
    setRazorPaySignature,
    setRazorPayOrderId,
    setRazorPayPaymentId,
    setShowError,
  ]);

  const handlePaymentFailure = useCallback((response: any) => {
    setRazorPayOrderId(response.error.metadata.order_id);
  }, []);
  const creatingRazorPayOptions = async (orderId: string) => {
    if (!orderId) {
      setIsLoading(false); // Ensure isLoading is turned off if there's no orderId
      return;
    }
    let isScriptLoaded = false;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const timeoutId = setTimeout(() => {
      if (!isScriptLoaded) {
        toast.error("Facing Internet Issue! Please try again.");
        setIsLoading(false);
        document.body.removeChild(script);
      }
    }, 5000);

    script.onload = () => {
      isScriptLoaded = true;
      clearTimeout(timeoutId);
      const options = {
        key: merchantDetails.razorpayKeyId,
        amount: calculateFinalBill(billValue, claimedCoinz, claimCouponz, tips),
        currency: "INR",
        name: businessDetails?.name,
        description: "Test Transaction",
        image: businessDetails?.logoUrl,
        order_id: orderId,
        handler: (response) => {
          handlePaymentSuccess(response);
          window.onpopstate = null;
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone,
        },
        modal: {
          subscription_card_change: true,
          remember_customer: true,
          escape: false,
          backdropclose: false,
          handleback: false,
          ondismiss: () => {
            handlePaymentDismiss();
            window.onbeforeunload = null; // Remove the event listener on dismiss
            window.onpopstate = null;
            setIsLoading(false); // Set isLoading to false after dismiss
          },
        },

        notes: {
          address: "Paltribe solutions",
          businessId: businessId,
          total: calculateFinalBill(
            billValue,
            claimedCoinz,
            claimCouponz,
            tips,
          ),
          claimedCoins: claimedCoinz || claimCouponz,
          billValue: billValue,
          tips: tips,
          loyaltyId: loyaltySetting.loyaltyId,
          tableName: tableName,
          couponId: availedCoupon?._id,
          cashbackAvailable: availedCoupon?.cashbackAvailable,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);

      // Add event listener to prevent back navigation
      history.pushState(null, "", location.href); // Push initial state with an empty string for title
      window.onbeforeunload = (event) => {
        event.preventDefault();
        event.returnValue = ""; // Custom message is no longer supported in most browsers
        // Redirect to a specific URL
        window.location.href = `/${customLink}/payment?amount=${billValue}`; // Change to your desired URL
      };
      window.onpopstate = (event) => {
        event.preventDefault();
        // Redirect to a specific URL
        window.location.href = `/${customLink}/payment?amount=${billValue}`; // Change to your desired URL
      };

      rzp1.open();

      // Remove the event listener when the user starts the payment process
      document.addEventListener("rzp_payment_start", () => {
        window.onbeforeunload = null;
        // setIsLoading(false); // Set isLoading to false once payment starts
      });

      rzp1.on("payment.failed", (response) => {
        handlePaymentFailure(response);
        window.onbeforeunload = null;
        window.onpopstate = null; // Remove the event listener on payment failure
        setIsLoading(false); // Set isLoading to false on payment failure
      });
    };

    script.onerror = () => {
      toast.error("Failed to load Razorpay. Please try again later.");
      setIsLoading(false); // Set isLoading to false if script loading fails
    };
  };


  const handleCreateOfflineOrder = useCallback(async () => {
    if (tableName === "") {
      toast.error("Please scan qr to start");
      return router.push(`/${customLink}/scan`);
    }
    if (isLoading) {
      return toast.error(
        "Please wait for the previous transaction to complete",
      );
    }
    setIsLoading(true);
    const res = await apiRpc.payments.createOfflineOrder.$post({
      json: {
        businessId: businessId || "",
        total: calculateFinalBill(billValue, claimedCoinz, claimCouponz, tips),
        claimedCoins: claimedCoinz || claimCouponz,
        billValue: billValue,
        userId: userDetails?._id,
        tips: tips,
        currency: "INR",
        tableName: tableName,
        couponId: availedCoupon?._id,
        ...(channelId && { channelId }),
        cashbackAvailable: availedCoupon?.cashbackAvailable,
      },
    });
    if (res.status === 401) {
      setIsLoading(false);
      return errorText(res.status);
    }
    const response = (await res.json()) as unknown as {
      data: { order_id: string };
      message: string;
    };
    if (res.status === 400) {
      setIsLoading(false);
      return toast.error(response?.message || "Something went wrong");
    }
    if (response?.data?.order_id) {
      const total = calculateFinalBill(
        billValue,
        claimedCoinz,
        claimCouponz,
        tips,
      );
      let finalReward = 0;
      if (
        (availedCoupon?.cashbackAvailable && claimCouponz > 0) ||
        claimedCoinz > 0 ||
        (claimedCoinz === 0 && claimCouponz === 0)
      ) {
        const coinsObtained =
          total * (loyaltySetting?.setCashBackPercentage / 100);
        const existingCoins = claimedCoinz
          ? userCoinz - claimedCoinz
          : userCoinz;
        finalReward = calculateReward(
          existingCoins,
          coinsObtained,
          loyaltySetting?.rewardLimit,
        ).finalReward;
      }
      toast.success(
        "We sent notification to the staff for offline payment. Please wait for the staff to confirm the payment.",
      );
      resetTableData();
      router.push(
        `/${customLink}/review?amount=${total}&mode=offline&claim=${Math.round(
          finalReward,
        )}&orderId=${response?.data?.order_id}`,
      );
    }
  }, [
    tableName,
    isLoading,
    setIsLoading,
    apiRpc,
    businessId,
    billValue,
    claimedCoinz,
    claimCouponz,
    tips,
    userDetails?._id,
    availedCoupon?._id,
    channelId,
    availedCoupon?.cashbackAvailable,
    loyaltySetting?.setCashBackPercentage,
    loyaltySetting?.rewardLimit,
    userCoinz,
    setTableName,
    router,
    customLink,
  ]);

  const createRazorPayOrder = useCallback(
    async (total: number): Promise<string> => {
      const res = await apiRpc.payments.createOrder[":merchantId"].$post({
        param: {
          merchantId: merchantDetails.razorpayMerchantId,
        },
        json: {
          businessId: businessId || "",
          total: calculateFinalBill(
            billValue,
            claimedCoinz,
            claimCouponz,
            tips,
          ),
          currency: "INR",
          claimedCoins: claimedCoinz || claimCouponz,
          billValue: billValue,
          userId: userDetails?._id,
          tips: tips,
          tableName: tableName,
          couponId: availedCoupon?._id,
          ...(channelId && { channelId }),
          cashbackAvailable: availedCoupon?.cashbackAvailable,
        },
      });
      if (!res.ok) {
        setIsLoading(false);
        errorText(res.status);
      }
      const response = (await res.json()) as unknown as { data: string };
      const orderId = response.data.order_id;
      setRazorPayOrderId(orderId);
      return orderId;
    },
    [
      merchantDetails.razorpayMerchantId,
      businessId,
      billValue,
      claimedCoinz,
      claimCouponz,
      tips,
      userDetails?._id,
      tableName,
      availedCoupon?._id,
      channelId,
      availedCoupon?.cashbackAvailable,
      setRazorPayOrderId,
    ],
  );

  const handleMode = useCallback(
    (mode: PageStates) => {
      if (billValue === 0) {
        setShowScan(true)
        return
      }
      if (showInput) {
        return toast.error("Please save the tip amount");
      }
      if (!tableName) {
        toast.error("Please Scan Again");
        return router.push(`/${customLink}/scan`);
      }
      if (billValue - claimedCoinz - claimCouponz + tips === 0)
        return toast.error("Please enter the bill amount");
      setSelectedMode(mode);
    },
    [
      showInput,
      selectedMode,
      tableName,
      billValue,
      claimedCoinz,
      claimCouponz,
      tips,
    ],
  );

  const handleApplyCoinz = useCallback(
    (finalValue: number) => {
      setClaimedCoinz(finalValue);
      handleCoins(finalValue);
    },
    [claimedCoinz],
  );

  const handleBack = useCallback(() => {
    switch (selectedMode) {
      case "MODE":
      case "ONLINE":
      case "OFFLINE":
        return setSelectedMode("INVOICE");
      case "INVOICE":
        router.push(`${routePaths[PAGE_TYPES.CATEGORY](customLink || "")}`);
        break;
      default:
        break;
    }
  }, [selectedMode]);

  const handleCoins = async (claimedCoinz: number) => {
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
  };

  console.log('PaymentWithCouponz render');

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
            {showBillPage ? <BottomPopUp bottomCross hide show={showBillPage} onClose={() => setShowBillPage(false)}>
              <BillPage billData={billData} />
            </BottomPopUp>
              : <div>
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
              </div>}
          </>
        )}
      </>
    </main>
  );
};

const PaymentWithCouponz = memo(MemoPaymentWithCouponz);
export default PaymentWithCouponz;
