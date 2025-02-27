import { useCart } from "@/components/store/useCart";
import { useErrorHandling } from "@/utils/helper";
import { apiRpc } from "@hi/common";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, usePathname, useRouter } from "next/navigation";
import { type ChangeEvent, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { _useAllBusiness } from "../store/useAllBusiness";
import useBusinessDetails from "../store/useBusinessDetails";
import { useCartStore } from "../store/useCartStore";
import { useCouponz } from "../store/useCouponz";
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
  calculateReward,
} from "../utils/helpers";
import { useSearchParams } from "next/navigation";
import useCouponTemp from "../store/useCouponTemp";

export const usePayments = () => {
  const { businessDetails } = useBusinessDetails();
  const pathName = usePathname();
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
  const finalAmountForReward = useMemo(() => {
    return outletInfo?.isPosEnabled ? billData?.subTotal : billValue;
  }, [outletInfo?.isPosEnabled, billData?.subTotal, billValue]);

  // initialTotal for sending to razorpay
  const initialTotal = useMemo(() => {
    return outletInfo?.isPosEnabled ? billData?.initialTotal : billValue;
  }, [outletInfo?.isPosEnabled, billData?.initialTotal, billValue]);

  const { tableName, setTableName } = useTableData();
  // payment response
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
          paidAmount: finalAmount?.toString(),
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
        finalAmount * (loyaltySetting?.setCashBackPercentage / 100);
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
      } else if (
        (availedCoupon?.cashbackAvailable && claimCouponz > 0) ||
        claimedCoins > 0 ||
        (claimedCoins === 0 && claimCouponz === 0)
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
      const res = await apiRpc.payments.createOrder[":merchantId"].$post({
        param: {
          merchantId: merchantDetails.razorpayMerchantId,
        },
        json: {
          businessId: businessId || "",
          total: finalAmount,
          currency: "INR",
          claimedCoins: claimedCoins || claimCouponz,
          billValue: initialTotal,
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
          claimedCoins: claimedCoins || claimCouponz,
          billValue: initialTotal,
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
    setIsLoading(true);
    const res = await apiRpc.payments.createOfflineOrder.$post({
      json: {
        businessId: businessId || "",
        total: finalAmount,
        claimedCoins: claimedCoins || claimCouponz,
        billValue: initialTotal,
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
  const setClaimedCoins = usePaymentStore((state) => state.setClaimedCoins);
  const setEditBillModal = usePaymentStore((state) => state.setEditBillModal);
  const setBillValue = usePaymentStore((state) => state.setBillValue);
  const setBillData = usePaymentStore((state) => state.setBillData);
  const selectedMode = usePaymentStore((state) => state.selectedMode);
  const setSelectedTip = usePaymentStore((state) => state.setSelectedTip);
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
    setBillData(payment);
    setBillValue(payment?.total);
    setClaimedCoins(payment?.claimedCoins);
    setSelectedTip(payment?.tips?.toString() || "");
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
  const { updateBill } = useUpdateBill();
  const {
    setIsTipActive,
    tips,
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
    mutateAsync({
      tips: 0,
    });
  }, [setTips, setSelectedTip, setCustomTip, setShowInput, setIsTipActive]);

  const { mutateAsync } = useMutation({
    mutationFn: updateBill,
  });

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
        mutateAsync({
          tips: Number(tip),
        });
      }
    },
    [setSelectedTip, setShowInput, setCustomTip, setTips, mutateAsync],
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
    mutateAsync({
      tips: Number(tips),
    });
  }, [setShowInput, mutateAsync, tips]);

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
            customerName: userDetails?.name || "Guest",
            customerPhone: userDetails?.phone,
            hiCode: hiCode || "",
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

export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  const pathName = usePathname();
  const { loyaltySetting } = useLoyaltyData();
  const { billData } = usePaymentStore();
  const { tableName } = useTableData();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const updateBill = async (data: OptionalPropsData) => {
    const { coinz, tips, couponId } = data;
    const response = await apiRpc.payments.fetch_update_bill[
      ":businessId"
    ].$post({
      param: {
        businessId: loyaltySetting.businessId,
      },
      json: {
        tableName: tableName,
        total: billData?.total,
        ...(coinz && { claimedCoins: coinz }),
        ...(coinz === 0 && { removeCoins: true }),
        ...(tips && { tips: tips }),
        ...(tips === 0 && { removeTips: true }),
        ...(couponId && { couponId }),
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

  return { updateBill };
};

export const useGetOrderId = () => {
  const orderId = useSearchParams().get("orderId") as string;
  const { setBillValue, setBillData, setClaimedCoins, setSelectedTip } =
    usePaymentStore();

  const { setTableName } = useTableData();

  const handleGetOrderId = async () => {
    try {
      const response = await apiRpc.surl.get_table_data[":orderId"].$get({
        param: {
          orderId: orderId,
        },
      });
      const res = await response.json();
      const payment = res.data as BillData;
      if (response?.status === 404) {
        toast.error(response?.data?.message || "Something went wrong");
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
