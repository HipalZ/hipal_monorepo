import { apiRpc } from "@hi/common";
import {
  calculateFinalBill,
  calculateReward,
  type PageStates,
} from "../utils/helpers";
import { toast } from "react-toastify";
import { type ChangeEvent, useCallback } from "react";
import { useCouponz } from "../store/useCouponz";
import { useErrorHandling } from "@/utils/helper";
import { useLogin } from "../store/useLogin";
import { useParams, useRouter } from "next/navigation";
import { usePaymentStore } from "../store/usePaymentStore";
import useBusinessDetails from "../store/useBusinessDetails";
import useLoyaltyData from "../store/useLoyaltyData";
import usePayment from "../store/usePayment";
import useTableData, { resetTableData } from "../store/useTableData";
import { useQuery } from "@tanstack/react-query";
import { _useAllBusiness } from "../store/useAllBusiness";
import type { IBillData } from "../types/businessData";
import { useCart } from "@/components/store/useCart";

export const usePayments = () => {
  const { businessDetails } = useBusinessDetails();
  const { errorText } = useErrorHandling();
  const { loyaltySetting } = useLoyaltyData();
  const businessId = useBusinessDetails((s) => s.businessDetails?.businessId);
  const customLink = useParams()?.businessId as string;
  const router = useRouter();
  const { availedCoupon, channelId, setChannelId } = useCouponz((s) => ({
    availedCoupon: s.availedCoupon,
    channelId: s.channelId,
    setChannelId: s.setChannelId,
  }));
  const { userDetails } = useLogin((s) => ({ userDetails: s.userDetails }));
  const { setRazorPayPaymentId, setRazorPayOrderId, setRazorPaySignature } =
    usePayment();
  const {
    isLoading,
    setIsLoading,
    merchantDetails,
    billValue,
    claimedCoinz,
    claimCouponz,
    tips,
    userCoinz,
    setShowError,
  } = usePaymentStore((s) => ({
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading,
    merchantDetails: s.merchantDetails,
    billValue: s.billValue,
    claimedCoinz: s.claimedCoinz,
    claimCouponz: s.claimCouponz,
    tips: s.tips,
    userCoinz: s.userCoinz,
    setShowError: s.setShowError,
  }));
  const { tableName, setTableName } = useTableData();
  // payment response
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
      if (res.status === 401) {
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
        // setIsLoading(false);
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
  // payment success
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
  // payment dismiss
  const handlePaymentDismiss = useCallback(() => {
    setRazorPaySignature("");
    setRazorPayOrderId("");
    setRazorPayPaymentId("");
    setShowError(true);
    toast.error("Payment failed");
    setTimeout(() => {
      setShowError(false);
    }, 1000);
  }, [
    setRazorPaySignature,
    setRazorPayOrderId,
    setRazorPayPaymentId,
    setShowError,
  ]);
  // create order for razorpay
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
  // create order
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
  // create razorpay options
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
  // create offline order
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
  // payment failure
  const handlePaymentFailure = useCallback((response: any) => {
    setRazorPayOrderId(response.error.metadata.order_id);
  }, []);

  return {
    handleCreateOrder,
  };
};

export const useHandleMode = () => {
  const {
    selectedMode,
    setSelectedMode,
    showInput,
    billValue,
    tips,
    claimedCoinz,
    claimCouponz,
  } = usePaymentStore((s) => ({
    selectedMode: s.selectedMode,
    setSelectedMode: s.setSelectedMode,
    showInput: s.showInput,
    billValue: s.billValue,
    tips: s.tips,
    claimedCoinz: s.claimedCoinz,
    claimCouponz: s.claimCouponz,
  }));
  const { tableName } = useTableData();

  const customLink = useParams()?.businessId as string;
  const router = useRouter();
  const handleMode = useCallback(
    (mode: PageStates) => {
      if (showInput) {
        return toast.error("Please save the tip amount");
      }
      if (!tableName) {
        toast.error("Please Scan Again");
        return router.push(`/${customLink}/scan`);
      }
      if (billValue - claimedCoinz - claimCouponz + tips === 0)
        return toast.error("Please scan to pay");
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
  return {
    handleMode,
  };
};

export const useGetBill = () => {
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const tableName = useTableData((state) => state.tableName);
  const userDetails = useLogin((state) => state.userDetails);
  const setEditBillModal = usePaymentStore((state) => state.setEditBillModal);
  const setBillValue = usePaymentStore((state) => state.setBillValue);
  const setBillData = usePaymentStore((state) => state.setBillData);
  const selectedMode = usePaymentStore((state) => state.selectedMode);
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
    setBillData(payment);
    setBillValue(payment.total);
    if (payment?.total === 0) {
      setEditBillModal(true);
    }
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
    enabled: selectedMode !== "MODE",
  });

  return { isLoading, billData, refetch, failureCount, isError, error };
};

export const useDisplayValue = () => {
  function getDisplayValue(
    billValue: number,
    claimedCoinz: number,
    claimCouponz: number,
  ): number {
    if (claimedCoinz > 0) {
      return claimedCoinz;
    }
    if (claimCouponz > billValue) {
      return billValue;
    }
    return claimCouponz;
  }

  return {
    getDisplayValue,
  };
};

export const useBillSummary = () => {
  const {
    isTipActive,
    setIsTipActive,
    setTips,
    setSelectedTip,
    setCustomTip,
    setShowInput,
  } = usePaymentStore();
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

  return {
    clearTheTip,
    handleTipSelect,
    handleCustomTip,
    handleSaveTip,
  };
};

export const useAuthTableUser = ()=>{
  const tableName = useTableData((s)=>s.tableName)
  const businessId = useBusinessDetails((s)=>s.businessDetails?.businessId)
  const setHiCodePopup = useTableData((s)=>s.setHiCodePopup)
  const userId = useLogin((s)=>s.userDetails?._id)
  const setHiCode = useLogin((s)=>s.setHiCode)
  const {setShowCart, showCart, setCartPage} = useCart()
  const authTableUser = useCallback(async()=>{
    const response = await apiRpc.pos.table_user_auth[":userId"].$post({
      json:{
        businessId,
        tableName,
        userId
      },
      param:{
        userId
      }
    })
    const res = await response.json()
    if(response.status===200){
      setHiCode(res.data.hiCode)
      setShowCart(!showCart)
      setCartPage("order");
      setHiCodePopup(true)
    }if(response.status===403){
      return toast.error(res.message)
    }
    return res;
  },[])

  return {authTableUser}
}
