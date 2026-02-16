import { useCart } from "@/components/store/useCart";
import { useErrorHandling } from "@/utils/helper";
import { apiRpc } from "@hi/common";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { type ChangeEvent, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { _useAllBusiness } from "../store/useAllBusiness";
import useBusinessDetails from "../store/useBusinessDetails";
import { useCartStore } from "../store/useCartStore";
import { useCouponz } from "../store/useCouponz";
import { useError } from "../store/useError";
import { useLogin } from "../store/useLogin";
import useLoyaltyData from "../store/useLoyaltyData";
import usePayment from "../store/usePayment";
import { usePaymentStore } from "../store/usePaymentStore";
import useTableData, {
  type HiCodeUser,
  resetTableData,
} from "../store/useTableData";
import type { BillData, OptionalPropsData } from "../types/businessData";
import {
  type PageStates,
  calculateFinalBill,
  calculateHelperReward,
} from "../utils/helpers";

export const usePayments = () => {
  const { setOpenErrorModal, setError } = useError();
  const pathName = usePathname();
  const { errorText } = useErrorHandling();
  const { loyaltySetting } = useLoyaltyData();
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
    billData,
    claimedCoins,
    claimCouponz,
    tips,
    userCoinz,
    setShowError,
  } = usePaymentStore((s) => ({
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading,
    merchantDetails: s.merchantDetails,
    billValue: s.billValue,
    billData: s.billData,
    claimedCoins: s.claimedCoins,
    claimCouponz: s.claimCouponz,
    tips: s.tips,
    userCoinz: s.userCoinz,
    setShowError: s.setShowError,
  }));
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const businessDetails = useBusinessDetails((s) => s.businessDetails);
  const businessId = _useAllBusiness(
    (state) => state.data.outletInfo?.businessId,
  );
  // for pos and non pos finalAmount varies
  const finalAmount = useMemo(() => {
    return outletInfo?.isPosEnabled
      ? billData?.total
      : calculateFinalBill(billValue, claimedCoins, claimCouponz, tips);
  }, [
    outletInfo?.isPosEnabled,
    billData?.total,
    billValue,
    claimedCoins,
    claimCouponz,
    tips,
  ]);

  // calculation of revward
  const subTotalWithoutCoinz = useMemo(() => {
    return (
      Number(billData?.subTotal ?? 0) - Number(billData?.claimedCoins ?? 0)
    );
  }, [billData?.subTotal, billData?.claimedCoins]);

  const finalAmountForReward = useMemo(() => {
    return outletInfo?.isPosEnabled
      ? subTotalWithoutCoinz
      : billValue - claimedCoins;
  }, [outletInfo?.isPosEnabled, subTotalWithoutCoinz, billValue, claimedCoins]);

  // initialTotal for sending to razorpay
  const initialTotal = useMemo(() => {
    return outletInfo?.isPosEnabled ? billData?.total : billValue;
  }, [outletInfo?.isPosEnabled, billData?.total, billValue]);

  const { tableName, setTableName } = useTableData();
  // payment response
  const sendPaymentResponse = useCallback(
    async (response: any) => {
      console.log("claimedCoins", claimedCoins);
      let coinsObtained = Math.round(
        finalAmountForReward * (loyaltySetting?.setCashBackPercentage / 100),
      );
      const netCoinz = -claimedCoins + coinsObtained;
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
          paidAmount: finalAmount?.toString(),
          tableName: tableName,
          businessId: businessId,
          netCoinz,
        },
      });
      if (res.status === 401) {
        return errorText(res.status);
      }
      const data = await res.json();
      const orderId = data?.data as string;
      const existingCoins = claimedCoins ? userCoinz - claimedCoins : userCoinz;
      let finalReward = 0;
      if (
        outletInfo?.isPosEnabled &&
        ((availedCoupon?.cashbackAvailable && claimCouponz > 0) ||
          claimedCoins > 0 ||
          (claimedCoins === 0 && claimCouponz === 0))
      ) {
        finalReward =
          billData?.subTotal * (loyaltySetting?.setCashBackPercentage / 100);
        finalReward = calculateHelperReward(
          existingCoins,
          coinsObtained,
          loyaltySetting?.rewardLimit,
        )?.finalReward;
      } else if (
        (availedCoupon?.cashbackAvailable && claimCouponz > 0) ||
        claimedCoins > 0 ||
        (claimedCoins === 0 && claimCouponz === 0)
      ) {
        finalReward = calculateHelperReward(
          existingCoins,
          coinsObtained,
          loyaltySetting?.rewardLimit,
        )?.finalReward;
      }
      console.log("finalReward", finalReward);
      if (res.status === 200) {
        toast.success("Payment successful");
        setRazorPaySignature("");
        setRazorPayOrderId("");
        setRazorPayPaymentId("");
        resetTableData();
        setChannelId("");
        // setIsLoading(false);
        return router.push(
          `/${customLink}/review?amount=${finalAmount}&mode=online&claim=${Math.round(
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
      claimedCoins,
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
      const payload = {
        businessId: businessId || "",
        total: finalAmount,
        currency: "INR",
        claimedCoins: outletInfo?.isPosEnabled
          ? billData?.claimedCoins
          : claimedCoins || claimCouponz,
        billValue: initialTotal,
        userId: userDetails?._id,
        tips: outletInfo?.isPosEnabled ? billData?.tips : tips,
        tableName: tableName,
        couponId: availedCoupon?._id,
        ...(channelId && { channelId }),
        cashbackAvailable: availedCoupon?.cashbackAvailable,
      };
      if (billData?.variantId) {
        payload.variantId = billData.variantId;
      }

      const res = await apiRpc.payments.createOrder[":merchantId"].$post({
        param: {
          merchantId: merchantDetails.razorpayMerchantId,
        },
        json: payload,
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
      claimedCoins,
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
      if (total < 0) {
        return toast.error("Invalid amount");
      }
      if (tableName === "" && !pathName.includes("posPayment")) {
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
        amount: finalAmount,
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
          total: finalAmount,
          claimedCoins: outletInfo?.isPosEnabled
            ? billData?.claimedCoins
            : claimedCoins || claimCouponz,
          billValue: initialTotal,
          tips: outletInfo?.isPosEnabled ? billData?.tips : tips,
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
        window.location.href = `/${customLink}/payment?amount=${initialTotal}`; // Change to your desired URL
      };
      window.onpopstate = (event) => {
        event.preventDefault();
        // Redirect to a specific URL
        window.location.href = `/${customLink}/payment?amount=${initialTotal}`; // Change to your desired URL
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
    if (tableName === "" && !pathName.includes("posPayment")) {
      toast.error("Please scan qr to start");
      return router.push(`/${customLink}/scan`);
    }
    if (isLoading) {
      return toast.error(
        "Please wait for the previous transaction to complete",
      );
    }
    console.log("handleCreateOfflineOrder called", billData);
    setIsLoading(true);

    const payload = {
      businessId: businessId || "",
      total: finalAmount,
      claimedCoins: outletInfo?.isPosEnabled
        ? billData?.claimedCoins
        : claimedCoins || claimCouponz,
      billValue: outletInfo?.isPosEnabled ? billData?.subTotal : initialTotal,
      userId: userDetails?._id,
      tips: outletInfo?.isPosEnabled ? billData?.tips : tips,
      currency: "INR",
      tableName: tableName,
      couponId: availedCoupon?._id,
      ...(channelId && { channelId }),
      cashbackAvailable: availedCoupon?.cashbackAvailable,
    };
    if (billData?.variantId) {
      payload.variantId = billData.variantId;
    }

    const res = await apiRpc.payments.createOfflineOrder.$post({
      json: payload,
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
      setOpenErrorModal(true);
      setError(response.message);
      return;
    }
    if (response?.data?.order_id) {
      let finalReward = 0;
      if (
        (availedCoupon?.cashbackAvailable && claimCouponz > 0) ||
        claimedCoins > 0 ||
        (claimedCoins === 0 && claimCouponz === 0)
      ) {
        const coinsObtained =
          finalAmountForReward * (loyaltySetting?.setCashBackPercentage / 100);
        const existingCoins = claimedCoins
          ? userCoinz - claimedCoins
          : userCoinz;
        finalReward = calculateHelperReward(
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
        `/${customLink}/review?amount=${finalAmount}&mode=offline&claim=${Math.round(
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
    claimedCoins,
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
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const {
    selectedMode,
    setSelectedMode,
    showInput,
    billValue,
    tips,
    claimedCoins,
    claimCouponz,
    billData,
  } = usePaymentStore((s) => ({
    selectedMode: s.selectedMode,
    setSelectedMode: s.setSelectedMode,
    showInput: s.showInput,
    billValue: s.billValue,
    tips: s.tips,
    claimedCoins: s.claimedCoins,
    claimCouponz: s.claimCouponz,
    billData: s.billData,
  }));
  const initialTotal = outletInfo?.isPosEnabled
    ? billData?.initialTotal
    : billValue;
  const { tableName } = useTableData();
  const pathName = usePathname();
  const customLink = useParams()?.businessId as string;
  const router = useRouter();
  const handleMode = useCallback(
    (mode: PageStates) => {
      if (showInput) {
        return toast.error("Please save the tip amount");
      }
      if (!tableName && !pathName.includes("posPayment")) {
        toast.error("Please Scan Again");
        return router.push(`/${customLink}/scan`);
      }
      if (initialTotal - claimedCoins - claimCouponz + tips === 0)
        return toast.error("Please scan to pay");
      setSelectedMode(mode);
    },
    [
      showInput,
      selectedMode,
      tableName,
      initialTotal,
      claimedCoins,
      claimCouponz,
      tips,
    ],
  );
  return {
    handleMode,
  };
};

export const useGetBill = () => {
  const pathName = usePathname();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const tableName = useTableData((state) => state.tableName);
  const userDetails = useLogin((state) => state.userDetails);
  const setEditBillModal = usePaymentStore((state) => state.setEditBillModal);
  const setBillValue = usePaymentStore((state) => state.setBillValue);
  const setClaimedCoins = usePaymentStore((state) => state.setClaimedCoins);
  const setBillData = usePaymentStore((state) => state.setBillData);
  const setIsBillSplit = usePaymentStore((state) => state.setIsBillSplit);
  const setSelectedTip = usePaymentStore((state) => state.setSelectedTip);
  const selectedMode = usePaymentStore((state) => state.selectedMode);
  const selectedBill = usePaymentStore((state) => state.selectedBill);

  const normalize = (v?: string | number | null) => (v ?? "").toString().trim();

  function pickSelectedVariantFromPayment(
    payment: BillData | BillData[],
    selected?: BillData | null,
  ): BillData | null {
    if (!payment) return null;

    // Not a split bill
    if (!Array.isArray(payment)) return payment;

    // No selection yet → pick first
    if (!selected) return payment[0] ?? null;

    const selVariantId = normalize(selected.variantId);
    const selBillId = normalize(selected.billId);
    const selVariantNum = selected.variantName;

    const match =
      payment.find(
        (p) => selVariantId && normalize(p.variantId) === selVariantId,
      ) ??
      payment.find((p) => selBillId && normalize(p.billId) === selBillId) ??
      payment.find(
        (p) => selVariantNum != null && p.variantName === selVariantNum,
      );

    return match ?? payment[0] ?? null;
  }

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
    const payment = res?.data as BillData;
    const isSplitBill = Array.isArray(payment);
    if (selectedBill) {
      const picked = pickSelectedVariantFromPayment(payment, selectedBill);
      setBillData(picked);
      setBillValue(picked?.total);
      setClaimedCoins(picked?.claimedCoins);
      setSelectedTip(picked?.tips?.toString() || "");
      return picked;
    } else if (!selectedBill && isSplitBill) {
      setIsBillSplit(isSplitBill);
      setBillData(payment);
      setBillValue(payment?.total);
      setClaimedCoins(payment?.claimedCoins);
      setSelectedTip(payment?.tips?.toString() || "");
    } else if (!selectedBill && !isSplitBill) {
      setIsBillSplit(isSplitBill);
      setBillData(payment);
      setBillValue(payment?.total);
      setClaimedCoins(payment?.claimedCoins);
      setSelectedTip(payment?.tips?.toString() || "");
    }
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
    enabled:
      selectedMode !== "MODE" &&
      !pathName?.includes("posPayment") &&
      !!outletInfo?.isPosEnabled,
  });

  return { isLoading, billData, refetch, failureCount, isError, error };
};

export const useDisplayValue = () => {
  function getDisplayValue(
    billValue: number,
    claimedCoins: number,
    claimCouponz: number,
  ): number {
    if (claimedCoins > 0) {
      return claimedCoins;
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
  const { addTips, removeTips } = useUpdateBill();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const removeTipsMutation = useMutation({ mutationFn: removeTips });
  const billData = usePaymentStore((state) => state.billData);
  const addTipsMutation = useMutation({ mutationFn: addTips });
  const {
    setIsTipActive,
    tips,
    setTips,
    setSelectedTip,
    setCustomTip,
    setShowInput,
  } = usePaymentStore();
  const clearTheTip = useCallback(async () => {
    const payload = {
      tips: 0,
    };
    if (billData.variantId) {
      payload.variantId = billData.variantId;
    }

    if (outletInfo?.isPosEnabled) {
      await removeTipsMutation.mutateAsync(payload);
    }
    setSelectedTip("");
    setCustomTip("");
    setShowInput(false);
    setIsTipActive(false);
  }, [
    setSelectedTip,
    setCustomTip,
    setShowInput,
    setIsTipActive,
    removeTipsMutation,
    outletInfo?.isPosEnabled,
  ]);
  //// addd tips

  const handleTipSelect = useCallback(
    async (tip: string) => {
      if (tip === "Other") {
        setSelectedTip(tip);
        setShowInput(true);
        setCustomTip("");
        setTips(0);
      }
      setSelectedTip(tip);
      setShowInput(false);
      setCustomTip("");
      setTips(Number(tip));

      if (outletInfo?.isPosEnabled) {
        const payload = {
          tips: Number(tip),
        };
        if (billData.variantId) {
          payload.variantId = billData.variantId;
        }
        await addTipsMutation.mutateAsync(payload);
      }
    },
    [
      setSelectedTip,
      setShowInput,
      setCustomTip,
      setTips,
      addTipsMutation,
      outletInfo?.isPosEnabled,
    ],
  );

  const handleCustomTip = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.replace(/[^0-9.]/g, "");
      setCustomTip(value);
      setTips(Number(value));
    },
    [setCustomTip, setTips],
  );

  const handleSaveTip = useCallback(async () => {
    setShowInput(false);
    if (outletInfo?.isPosEnabled) {
      const payload = {
        tips: Number(tips),
      };
      if (billData.variantId) {
        payload.variantId = billData.variantId;
      }
      await addTipsMutation.mutateAsync(payload);
    }
  }, [setShowInput, addTipsMutation, tips, outletInfo?.isPosEnabled]);

  return {
    clearTheTip,
    handleTipSelect,
    handleCustomTip,
    handleSaveTip,
  };
};

export const useAuthTableUser = () => {
  const businessId = useBusinessDetails((s) => s.businessDetails?.businessId);
  const userId = useLogin((s) => s.userDetails?._id);
  const { tableName } = useTableData();
  const { setShowCart, setCartPage, setHiCodePopupBeforeBill } = useCart();
  const authTableUser = useCallback(async () => {
    const response = await apiRpc.pos.table_user_auth[":userId"].$post({
      json: {
        businessId,
        tableName,
        userId,
      },
      param: {
        userId,
      },
    });
    const res = await response.json();
    if (response.status === 200) {
      setCartPage("order");
      setShowCart(true);
    }
    if (response.status === 403) {
      setHiCodePopupBeforeBill(true);
    }
    return res;
  }, [
    businessId,
    tableName,
    userId,
    setHiCodePopupBeforeBill,
    setCartPage,
    setShowCart,
  ]);

  return { authTableUser };
};

export const usePlaceOrder = () => {
  const accessToken = useUserToken.getState().accessToken;
  const { setCheckLogin } = usePaymentStore();
  const router = useRouter();
  const setDirection = useLogin((s) => s.setDirection);
  const customLink = useParams()?.businessId as string;
  const { setShowCart, setOrderPlaced } = useCart();
  const {
    tableName,
    setTableName,
    setHiCode,
    hiCode,
    setHiCodePopup,
    setHiCodeUser,
  } = useTableData();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const userDetails = useLogin((state) => state.userDetails);
  const { cart } = useCartStore();
  const sanitizedCart = useMemo(() => {
    return cart.map(({ dish, ...item }) => {
      const { recommendationIds, addOnIds, ...sanitizedDish } = dish;
      return { ...item, dish: sanitizedDish };
    });
  }, [cart]);
  const triggerModal = useCallback(() => {
    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
      setShowCart(false);
    }, 5000);
  }, [setOrderPlaced, setShowCart]);
  const placeOrder = useCallback(async () => {
    if (!accessToken) {
      setCheckLogin(true);
      return;
    }
    const handleUnauthenticatedUser = () => {
      setDirection("category");
      setCheckLogin(true);
    };

    const handleMissingTableName = () => {
      setDirection("category");
      toast.error("Please scan QR");
      router.push(`/${customLink}/scan`);
    };

    const handleApiResponse = async (
      response,
      successMessage,
      errorMessage,
    ) => {
      try {
        const res = await response.json();
        if (response.status === 200 || response.status === 201) {
          if (successMessage?.length > 0) {
            toast.success(successMessage);
          }
          setShowCart(true);
          triggerModal();
          setHiCode(res?.data?.hiCode || null);
          useCartStore.setState({ cart: [] });
          return true;
        }
        if (response.status === 409) {
          toast.error(res?.message);
          setTableName(res?.data?.data?.tableName);
          setHiCode(res?.data?.data?.hiCode);
        }
        if (response.status === 403) {
          setHiCodeUser(res?.data as HiCodeUser);
          setHiCodePopup(true);
        } else {
          toast.error(res?.message || errorMessage || "Order failed");
        }
      } catch (error) {
        console.error("Error processing response:", error);
        toast.error("An error occurred while processing the response");
      }
      return false;
    };

    if (!accessToken) {
      handleUnauthenticatedUser();
      return;
    }

    if (!tableName && outletInfo?.outLetType !== "OTHER") {
      handleMissingTableName();
      return;
    }

    if (outletInfo?.isPosEnabled) {
      try {
        const response = await apiRpc.pos.save_kot.$post({
          json: {
            tableName,
            businessId: outletInfo?.businessId,
            internalCart: sanitizedCart,
            customerPhone: userDetails?.phone,
            userId: userDetails?._id,
          },
        });
        await handleApiResponse(response, "", "Failed to place order");
      } catch (error) {
        console.error("Error placing POS order:", error);
      }
    } else {
      try {
        const response = await apiRpc.cart.create.$post({
          json: {
            businessId: outletInfo?.businessId,
            userId: userDetails?._id,
            tableName,
            cart: sanitizedCart,
            name: userDetails?.name || "Guest",
            phone: userDetails?.phone,
          },
        });
        await handleApiResponse(
          response,
          "Cart shared successfully",
          "Failed to share cart",
        );
      } catch (error) {
        console.error("Error placing non-POS order:", error);
        toast.error("An error occurred while placing the non-POS order");
      }
    }
  }, [
    accessToken,
    setDirection,
    router,
    customLink,
    tableName,
    outletInfo,
    sanitizedCart,
    userDetails,
    setHiCode,
    setShowCart,
    setHiCodeUser,
    setHiCodePopup,
  ]);

  return { placeOrder };
};

export interface CouponProps {
  businessId: string;
  tableName: string;
  variantId?: string;
}

export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  const pathName = usePathname();
  const { loyaltySetting } = useLoyaltyData();
  const { tableName } = useTableData();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);

  const addCoins = async (data: OptionalPropsData) => {
    const response = await apiRpc.pos.add_coins.$post({
      json: data,
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      toast.success("Bill updated successfully");
      if (outletInfo?.isPosEnabled) {
        queryClient.invalidateQueries({
          queryKey: ["getBill", outletInfo?.businessId, tableName],
        });
      }
      if (pathName?.includes("posPayment")) {
        queryClient.invalidateQueries({
          queryKey: ["getBusinessDetails"],
        });
      }
    }
    return res;
  };

  const addCouponz = async (data: OptionalPropsData) => {
    const response = await apiRpc.pos.add_coupon.$post({
      json: data,
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      toast.success("Bill updated successfully");
      if (outletInfo?.isPosEnabled) {
        queryClient.invalidateQueries({
          queryKey: ["getBill", outletInfo?.businessId, tableName],
        });
      }
      if (pathName?.includes("posPayment")) {
        queryClient.invalidateQueries({
          queryKey: ["getBusinessDetails"],
        });
      }
    }
    return res;
  };

  const removeCoinz = async (payload) => {
    const response = await apiRpc.pos.remove_coins.$post({
      json: payload,
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      toast.success("Bill updated successfully");
      console.log("triggered");
      if (outletInfo?.isPosEnabled) {
        queryClient.invalidateQueries({
          queryKey: ["getBill", outletInfo?.businessId, tableName],
        });
      }
      if (pathName?.includes("posPayment")) {
        queryClient.invalidateQueries({
          queryKey: ["getBusinessDetails"],
        });
      }
    }
    return res;
  };

  const removeCouponz = async (payload: CouponProps) => {
    const response = await apiRpc.pos.remove_coupon.$post({
      json: payload,
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      toast.success("Bill updated successfully");
      if (outletInfo?.isPosEnabled) {
        queryClient.invalidateQueries({
          queryKey: ["getBill", outletInfo?.businessId, tableName],
        });
      }
      if (pathName?.includes("posPayment")) {
        queryClient.invalidateQueries({
          queryKey: ["getBusinessDetails"],
        });
      }
    }

    return res;
  };

  const addTips = async (data: OptionalPropsData) => {
    const { tips, variantId } = data;
    const payload = {
      value: tips,
      businessId: outletInfo.businessId,
      tableName,
    };
    if (variantId) {
      payload.variantId = variantId;
    }
    const response = await apiRpc.pos.add_tip.$post({
      json: payload,
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      toast.success("Bill updated successfully");
      if (outletInfo?.isPosEnabled) {
        queryClient.invalidateQueries({
          queryKey: ["getBill", outletInfo?.businessId, tableName],
        });
      }
      if (pathName?.includes("posPayment")) {
        queryClient.invalidateQueries({
          queryKey: ["getBusinessDetails"],
        });
      }
    }
    return res;
  };

  const removeTips = async (payload) => {
    const response = await apiRpc.pos.remove_tip.$post({
      json: {
        businessId: outletInfo.businessId,
        tableName,
        ...payload,
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      toast.success("Bill updated successfully");
      if (outletInfo?.isPosEnabled) {
        queryClient.invalidateQueries({
          queryKey: ["getBill", outletInfo?.businessId, tableName],
        });
      }
      if (pathName?.includes("posPayment")) {
        queryClient.invalidateQueries({
          queryKey: ["getBusinessDetails"],
        });
      }
    }
    return res;
  };

  return {
    addCoins,
    addCouponz,
    removeCoinz,
    removeCouponz,
    addTips,
    removeTips,
  };
};

export const useGetOrderId = () => {
  const orderId = useSearchParams().get("orderId") as string;
  const { setBillValue, setBillData, setClaimedCoins, setSelectedTip } =
    usePaymentStore();

  const { setTableName } = useTableData();

  const handleGetOrderId = async () => {
    try {
      const response = await apiRpc.pos.fetch_bill.$get({
        query: {
          orderId: orderId,
        },
      });
      const res = await response.json();
      const payment = res.data as BillData;
      if (response?.status === 404) {
        toast.error(res?.data?.message || "Something went wrong");
      }
      if (response?.status === 409) {
        toast.error(res?.data?.message || "Something went wrong");
      }
      if (payment?.tableName && payment?.tableName?.length > 0) {
        setTableName(payment?.tableName);
      }
      setBillValue(payment.total);
      setBillData(payment);
      setClaimedCoins(payment?.claimedCoins || 0);
      setSelectedTip(payment?.tips?.toString() || "");
      return payment;
    } catch (e) {
      console.error(e);
    }
  };

  const { isLoading } = useQuery({
    queryKey: ["getBusinessDetails", orderId],
    queryFn: handleGetOrderId,
    enabled: orderId !== null,
  });

  return { isLoading };
};
