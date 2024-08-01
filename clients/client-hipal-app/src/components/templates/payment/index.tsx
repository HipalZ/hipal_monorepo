"use client";
import { MdOutlineChevronLeft } from "react-icons/md";
import { type ChangeEvent, memo, useEffect, useState } from "react";
import type { IBusinessData, UserData } from "@/components/types/businessData";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import usePayment from "@/components/store/usePayment";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import useTableData from "@/components/store/useTableData";
import { useQuery } from "@tanstack/react-query";
import { calculateReward } from "@/components/utils/helpers";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import PlaceholderImg from "@/components/atoms/placeholder";
import Image from "next/image";
import { getRandomBlurImg } from "@/components/utils/images";
import PayLoader from "./payLoader";
import ErrorPayment from "./errorPay";
import { apiRpc } from "@hi/common";
import PaymentHeader from "./paymentHeader";

const BottomButton = dynamic(
  () => import("@/components/molecules/bottomButton"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={50} />,
  },
);

const PaymentComponent = dynamic(() => import("./selectPayment"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const AvailableCoinz = dynamic(() => import("./availableCoinz"), {
  ssr: false,
  loading: () => <SkeletonLoader height={250} />,
});

const BillSummary = dynamic(() => import("./billSummary"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const PaymentCard = dynamic(() => import("./paymentCard"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const UseCoinzPopup = dynamic(() => import("./useCoinzPopup"), {
  ssr: false,
  loading: () => <SkeletonLoader height={50} />,
});

export type PageStates = "INVOICE" | "MODE" | "ONLINE" | "OFFLINE";
export interface IMerchantDetails {
  businessId: string;
  razorpayMerchantId: string;
  razorpayKeyId: string;
}
const PaymentMemo = ({ data }: { data: IBusinessData }) => {
  const customLink = useParams()?.businessId as string;
  const businessId = data?.business?.businessId;
  const [isTipActive, setIsTipActive] = useState<boolean>(false);
  const [showInput, setShowInput] = useState(false);
  const [selectedTip, setSelectedTip] = useState("");
  const [customTip, setCustomTip] = useState("");
  const [selectedMode, setSelectedMode] = useState<PageStates>("INVOICE");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { userDetails } = useLogin();
  const {
    billValue,
    setBillValue,
    setUserCoinz,
    userCoinz,
    claimedCoinz,
    setClaimedCoinz,
    setTips,
    tips,
  } = usePaymentStore();
  const { businessDetails } = useBusinessDetails();
  const { tableName, setTableName } = useTableData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loyaltySetting } = useLoyaltyData();
  const [maxCoinz, setMaxCoinz] = useState(0);
  const [showError, setShowError] = useState(false);
  const [merchantDetails, setMerchantDetails] = useState<IMerchantDetails>({
    businessId: "",
    razorpayMerchantId: "",
    razorpayKeyId: "",
  });

  useEffect(() => {
    if (!tableName) {
      return router.push(`/${customLink}/explore`);
    }
  }, []);

  const { setRazorPayPaymentId, setRazorPayOrderId, setRazorPaySignature } =
    usePayment();

  // by default setting to zero instead of previous stale data
  useEffect(() => {
    setBillValue(0);
    setClaimedCoinz(0);
    setTips(0);
    setSelectedTip("");
    setCustomTip("");
  }, []);

  const getMerchantKeySecret = async () => {
    const res = await apiRpc.settings[":businessId"].getMerchantKeySecret.$get({
      param: {
        businessId: businessId || "",
      },
    });
    const response = await res.json();
    if (res.status === 200) {
      console.log("response", response);
      setMerchantDetails({
        businessId: businessId || "",
        razorpayMerchantId: response?.data?.razorpayMerchantId,
        razorpayKeyId: response?.data?.razorpayKeyId,
      });

      return response?.data;
    }

    //TODO: IF BUSINESS DOES NOT HAVE MERCHANT ID THEN SHOW ERROR AND AVOID PAYMENT
  };

  const handlePaymentSuccess = async (response: any) => {
    setIsLoading(true);
    await sendPaymentResponse(response);
    setRazorPaySignature(response.razorpay_signature);
    setRazorPayOrderId(response.razorpay_order_id);
    setRazorPayPaymentId(response.razorpay_payment_id);
  };

  const handlePaymentDismiss = () => {
    setRazorPaySignature("");
    setRazorPayOrderId("");
    setRazorPayPaymentId("");
    setShowError(true);
    toast.error("Payment failed");
    setTimeout(() => {
      setShowError(false);
    }, 2000);
  };

  const handlePaymentFailure = (response: any) => {
    setRazorPayOrderId(response.error.metadata.order_id);
  };

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
        amount: billValue - claimedCoinz + tips,
        currency: "INR",
        name: businessDetails?.name,
        description: "Test Transaction",
        image: businessDetails?.logoUrl,
        order_id: orderId,
        handler: (response) => {
          handlePaymentSuccess(response);
          window.onpopstate = null;
          setIsLoading(false); // Set isLoading to false after successful payment
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
          total: billValue - claimedCoinz + tips,
          claimedCoins: claimedCoinz,
          billValue: billValue,
          tips: tips,
          loyaltyId: loyaltySetting.loyaltyId,
          tableName: tableName,
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
        setIsLoading(false); // Set isLoading to false once payment starts
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

  const sendPaymentResponse = async (response: any) => {
    setIsLoading(true);
    const res = await apiRpc.payments.validPayment[":merchantId"].$post({
      param: {
        merchantId: merchantDetails.razorpayMerchantId,
      },
      json: {
        response,
      },
    });
    const data = await res.json();
    const orderId = data?.data as string;
    console.log("orderId", orderId);
    const total = billValue - claimedCoinz + tips;
    const coinsObtained = total * (loyaltySetting?.setCashBackPercentage / 100);
    const existingCoins = claimedCoinz ? userCoinz - claimedCoinz : userCoinz;
    const finalReward = calculateReward(
      existingCoins,
      coinsObtained,
      loyaltySetting?.rewardLimit,
    );
    if (res.status === 200) {
      toast.success("Payment successful");
      setRazorPaySignature("");
      setRazorPayOrderId("");
      setRazorPayPaymentId("");
      setTableName("");
      return router.push(
        `/${customLink}/review?amount=${total}&mode=online&claim=${Math.round(
          finalReward?.finalReward,
        )}&orderId=${orderId}`,
      );
    }
    toast.error("Payment failed");
  };

  const clearTheTip = () => {
    setTips(0);
    setSelectedTip("");
    setCustomTip("");
    setShowInput(false);
    setIsTipActive(false);
  };

  const handleCreateOfflineOrder = async () => {
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
        total: billValue - claimedCoinz + tips,
        claimedCoins: claimedCoinz,
        billValue: billValue,
        userId: userDetails?._id,
        tips: tips,
        currency: "INR",
        tableName: tableName,
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
      const total = billValue - claimedCoinz + tips;
      const coinsObtained =
        total * (loyaltySetting?.setCashBackPercentage / 100);
      const existingCoins = claimedCoinz ? userCoinz - claimedCoinz : userCoinz;
      const finalReward = calculateReward(
        existingCoins,
        coinsObtained,
        loyaltySetting?.rewardLimit,
      );
      toast.success(
        "We sent notification to the staff for offline payment. Please wait for the staff to confirm the payment.",
      );
      setTableName("");
      router.push(
        `/${customLink}/review?amount=${total}&mode=offline&claim=${Math.round(
          finalReward?.finalReward,
        )}&orderId=${response?.data?.order_id}`,
      );
      setIsLoading(false);
    }
  };

  const createRazorPayOrder = async (total: number): Promise<string> => {
    const res = await apiRpc.payments.createOrder[":merchantId"].$post({
      param: {
        merchantId: merchantDetails.razorpayMerchantId,
      },
      json: {
        businessId: businessId || "",
        total: billValue - claimedCoinz + tips,
        currency: "INR",
        claimedCoins: claimedCoinz,
        billValue: billValue,
        userId: userDetails?._id,
        tips: tips,
        tableName: tableName,
      },
    });
    const response = (await res.json()) as unknown as { data: string };
    const orderId = response.data.order_id;
    setRazorPayOrderId(orderId);
    return orderId;
  };

  const handleCreateOrder = async (total: number, mode: string) => {
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
      await creatingRazorPayOptions(orderId); // Keep isLoading true until Razorpay options are opened
    } catch (error) {
      console.log("error", error);
      toast.error("Session Expired please login to continue");
      setRazorPayPaymentId("");
      setRazorPaySignature("");
      setIsLoading(false); // Set isLoading to false only on error
      router.push(`/${customLink}/user/signup`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTipSelect = (tip: string) => {
    if (tip === "Other") {
      setSelectedTip(tip);
      setShowInput(true);
      setCustomTip("");
      setTips(0);
    } else {
      setSelectedTip(tip);
      setShowInput(false);
      setTips(Number(tip));
      setCustomTip("");
    }
  };

  const handleCustomTip = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9.]/g, "");
    setCustomTip(value);
    setTips(Number(value));
  };

  const handleSaveTip = () => {
    setShowInput(false);
  };

  const handleMode = (mode: PageStates) => {
    if (showInput) {
      return toast.error("Please save the tip amount");
    }
    setSelectedMode(mode);
  };

  const handleUserCoinz = async () => {
    const res = await apiRpc.users[":businessId"].getUserReward.$get({
      param: {
        businessId: businessId || "",
      },
      query: {
        userId: userDetails?._id,
        loyaltyId: data?.loyalty?.loyaltyId,
      },
    });
    const response = (await res.json()) as unknown as { data: UserData };
    if (res.status === 200) {
      setUserCoinz(response?.data?.rewards);
    }
    return response?.data?.rewards;
  };

  const openModal = async () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleApplyCoinz = (finalValue: number) => {
    setClaimedCoinz(finalValue);
    handleCoins(finalValue);
  };

  const handleBack = () => {
    if (selectedMode === "MODE") {
      return setSelectedMode("INVOICE");
    }
    router.push(`${routePaths[PAGE_TYPES.CATEGORY](customLink || "")}`);
  };

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

  useEffect(() => {
    getMerchantKeySecret();
    setBillValue(Number(searchParams?.get("amount")));
  }, []);

  useQuery({
    queryKey: ["getUserReward", userDetails?._id, data?.loyalty?.loyaltyId],
    queryFn: handleUserCoinz,
    enabled: !!userDetails?._id && !!data?.loyalty?.loyaltyId,
  });

  return (
    <>
      {isLoading ? (
        <PayLoader selectedMode={selectedMode} />
      ) : showError ? (
        <ErrorPayment />
      ) : (
        <div>
          <PaymentHeader handleBack={handleBack} />
          {selectedMode === "INVOICE" ? (
            <>
              <PaymentCard
                claimedCoinz={claimedCoinz}
                billValue={billValue}
                logo={data?.business?.logoUrl}
              />
              {userCoinz > 0 && (
                <UseCoinzPopup openModal={openModal} billValue={billValue} />
              )}
              <BillSummary
                billValue={billValue}
                claimedCoinz={claimedCoinz}
                tips={tips}
                isTipActive={isTipActive}
                setIsTipActive={setIsTipActive}
                clearTheTip={clearTheTip}
                handleTipSelect={handleTipSelect}
                selectedTip={selectedTip}
                customTip={customTip}
                showInput={showInput}
                handleCustomTip={handleCustomTip}
                handleSaveTip={handleSaveTip}
              />
              <BottomButton>
                <div
                  onClick={() => handleMode("MODE")}
                  className={`${
                    billValue > 0 ? "" : "opacity-20 pointer-events-none"
                  } bg-primary text-base-100 py-3 px-3 rounded-full`}
                >
                  <span>
                    Proceed to pay ₹ {billValue - claimedCoinz + tips}
                  </span>
                </div>
              </BottomButton>
            </>
          ) : (
            <PaymentComponent
              tips={tips}
              billValue={billValue}
              handleCreateOrder={handleCreateOrder}
              selectedMode={selectedMode}
              setSelectedMode={setSelectedMode}
              isLoading={isLoading}
              total={billValue - claimedCoinz + tips}
            />
          )}
          <AvailableCoinz
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            claimedCoinz={claimedCoinz}
            userCoinz={userCoinz}
            handleApplyCoinz={handleApplyCoinz}
            maxCoinz={maxCoinz}
            setMaxCoinz={setMaxCoinz}
            billValue={billValue}
            setClaimAmount={data?.loyalty?.setClaimedPercentage}
          />
        </div>
      )}
    </>
  );
};

const Payment = memo(PaymentMemo);
export default Payment;
