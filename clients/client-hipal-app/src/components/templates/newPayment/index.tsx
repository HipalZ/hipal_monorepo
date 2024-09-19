"use client";
import { useCallback, useEffect } from "react";
import { type ChangeEvent, memo } from "react";
import type { IBusinessData } from "@/components/types/businessData";
import { useParams, useRouter } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import usePayment from "@/components/store/usePayment";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import useTableData from "@/components/store/useTableData";
import {
  calculateReward,
  cn,
  type PageStates,
} from "@/components/utils/helpers";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { apiRpc } from "@hi/common";
import { BiArrowBack } from "react-icons/bi";
import Sunrays from "@/assets/img/sunrays_white.png";
import Image from "next/image";
import { getRandomBlurImg } from "@/components/utils/images";
import useCouponTemp from "@/components/store/useCouponTemp";
import { useCouponz } from "@/components/store/useCouponz";
import { useMerchantDetails } from "@/components/hooks/useMerchantSecret";
import { useUserCoinz } from "@/components/hooks/useUserCoinz";

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
  const businessId = data?.business?.businessId;
  const { setLoyaltySetting } = useLoyaltyData();
  const { userDetails } = useLogin((s) => ({ userDetails: s.userDetails }));
  const { availedCoupon } = useCouponz((s) => ({
    availedCoupon: s.availedCoupon,
  }));
  const { applyCouponz } = useCouponTemp((s) => ({
    applyCouponz: s.applyCouponz,
  }));

  const { setEditBillModal } = usePaymentStore((s) => ({
    setEditBillModal: s.setEditBillModal,
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
  } = usePaymentStore((s) => ({
    billValue: s.billValue,
    claimedCoinz: s.claimedCoinz,
    setClaimedCoinz: s.setClaimedCoinz,
    claimCouponz: s.claimCouponz,
    tips: s.tips,
    customTip: s.customTip,
    setCustomTip: s.setCustomTip,
    setTips: s.setTips,
    userCoinz: s.userCoinz,
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading,
    selectedMode: s.selectedMode,
    setSelectedMode: s.setSelectedMode,
    setSelectedTip: s.setSelectedTip,
    setIsTipActive: s.setIsTipActive,
    showInput: s.showInput,
    setShowInput: s.setShowInput,
    setIsModalOpen: s.setIsModalOpen,
    merchantDetails: s.merchantDetails,
    showError: s.showError,
    setShowError: s.setShowError,
  }));

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
        },
      });
      const data = await res.json();
      const orderId = data?.data as string;
      const total = billValue - claimedCoinz - claimCouponz + tips;
      const coinsObtained =
        total * (loyaltySetting?.setCashBackPercentage / 100);
      const existingCoins = claimedCoinz ? userCoinz - claimedCoinz : userCoinz;
      let finalReward = 0;
      if (
        (availedCoupon?.cashbackAvailable && claimCouponz > 0) ||
        claimedCoinz > 0 ||
        (claimedCoinz > 0 && claimCouponz === 0)
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
        setTableName("");
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
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const options = {
        key: merchantDetails.razorpayKeyId,
        amount: billValue - claimedCoinz - claimCouponz + tips,
        currency: "INR",
        name: businessDetails?.name,
        description: "Test Transaction",
        image: businessDetails?.logoUrl,
        order_id: orderId,
        handler: (response) => {
          handlePaymentSuccess(response);
          window.onpopstate = null;
          // setIsLoading(false); // Set isLoading to false after successful payment
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
          total: billValue - claimedCoinz - claimCouponz + tips,
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

  const clearTheTip = useCallback(() => {
    setTips(0);
    setSelectedTip("");
    setCustomTip("");
    setShowInput(false);
    setIsTipActive(false);
  }, [setTips, setSelectedTip, setCustomTip, setShowInput, setIsTipActive]);

  const handleCreateOfflineOrder = useCallback(async () => {
    if (tableName === "") {
      toast.error("Please scan to start");
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
        total: billValue - claimedCoinz - claimCouponz + tips,
        claimedCoins: claimedCoinz || claimCouponz,
        billValue: billValue,
        userId: userDetails?._id,
        tips: tips,
        currency: "INR",
        tableName: tableName,
        couponId: availedCoupon?._id,
        channelId: availedCoupon?.channelId,
        cashbackAvailable: availedCoupon?.cashbackAvailable,
      },
    });
    const response = (await res.json()) as unknown as {
      data: { order_id: string };
      message: string;
    };
    if (res.status === 400) {
      setIsLoading(false);
      return toast.error(response?.message || "Something went wrong");
    }
    if (response?.data?.order_id) {
      const total = billValue - claimedCoinz - claimCouponz + tips;
      let finalReward = 0;
      if (
        (availedCoupon?.cashbackAvailable && claimCouponz > 0) ||
        claimedCoinz > 0 ||
        (claimedCoinz > 0 && claimCouponz === 0)
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
      setTableName("");
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
    availedCoupon?.channelId,
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
          total: billValue - claimedCoinz - claimCouponz + tips,
          currency: "INR",
          claimedCoins: claimedCoinz || claimCouponz,
          billValue: billValue,
          userId: userDetails?._id,
          tips: tips,
          tableName: tableName,
          couponId: availedCoupon?._id,
          channelId: availedCoupon?.channelId,
          cashbackAvailable: availedCoupon?.cashbackAvailable,
        },
      });
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
      availedCoupon?.channelId,
      availedCoupon?.cashbackAvailable,
      setRazorPayOrderId,
    ],
  );

  const handleCreateOrder = useCallback(
    async (total: number, mode: string) => {
      if (total <= 0) {
        return toast.error("Invalid amount");
      }
      if (tableName === "") {
        toast.error("Please scan to start");
        return router.push(`/${customLink}/scan`);
      }
      if (mode.toLowerCase() === "offline") {
        await handleCreateOfflineOrder();
        return;
      }

      if (isLoading) {
        return toast.error(
          "Please wait for the previous transaction to complete",
        );
      }

      setIsLoading(true);
      try {
        const orderId = await createRazorPayOrder(total);
        await creatingRazorPayOptions(orderId);
      } catch (error) {
        toast.error("Something went wrong! Please try again later.");
        console.log("error", error);
        setRazorPayPaymentId("");
        setRazorPaySignature("");
        setIsLoading(false);
      }
    },
    [
      tableName,
      customLink,
      isLoading,
      createRazorPayOrder,
      router,
      setIsLoading,
      setRazorPayPaymentId,
      setRazorPaySignature,
    ],
  );

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
    [tips, customTip],
  );

  const handleSaveTip = useCallback(() => {
    setShowInput(false);
  }, [showInput]);

  const handleMode = useCallback(
    (mode: PageStates) => {
      if (showInput) {
        return toast.error("Please save the tip amount");
      }
      if (!tableName) {
        toast.error("Table Not Found Please Scan Again");
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

  return (
    <main className="relative h-screen bg-black">
      {isLoading ? (
        <MemoPayLoader selectedMode={selectedMode} />
      ) : showError ? (
        <ErrorPayment />
      ) : applyCouponz ? (
        <ApplyCouponz />
      ) : (
        <div>
          <section>
            <article onClick={handleBack} onKeyDown={handleBack}>
              <button
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
            </article>
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
                  <span className="relative z-20 text-sm">
                    {businessDetails?.branchName}
                  </span>
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
                  className="fixed bottom-0 w-full h-16 bg-white flex items-center justify-between px-4 !font-bold text-black"
                >
                  {!!tableName ? (
                    <h1 className="text-sm text-left inter">
                      Total Bill Amount: ₹{" "}
                      {billValue - claimedCoinz - claimCouponz + tips}
                      <span className="text-xs">
                        {claimedCoinz > 0 ? (
                          <p className="text-[#4CAF50]">
                            {claimedCoinz} Saved, using coinz
                          </p>
                        ) : null}
                      </span>
                    </h1>
                  ) : (
                    <h1 className="w-2/3 text-xs text-red-500">
                      Please scan the table to proceed with payment.
                    </h1>
                  )}
                  <article
                    onClick={() => handleMode("MODE")}
                    onKeyDown={() => handleMode("MODE")}
                    className={`${
                      billValue > 0 && !!tableName
                        ? ""
                        : "opacity-20 pointer-events-none"
                    } bg-black text-white px-3 py-2 rounded-lg inter text-sm on_active_bounce`}
                  >
                    <span>Pay Now</span>
                  </article>
                </section>
              </section>
            </>
          ) : (
            <PaymentComponent
              handleCreateOrder={handleCreateOrder}
              total={billValue - claimedCoinz - claimCouponz + tips}
            />
          )}
          <AvailableCoinz
            handleApplyCoinz={handleApplyCoinz}
            setClaimAmount={data?.loyalty?.setClaimedPercentage}
          />
        </div>
      )}
    </main>
  );
};

const PaymentWithCouponz = memo(MemoPaymentWithCouponz);
export default PaymentWithCouponz;
