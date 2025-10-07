"use client";

import { apiRpc } from "@hi/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useOrderStore } from "@store/useOrder";
import { usePaymentStore } from "@store/usePaymentStore";
import useBusinessDetails from "@store/useBusinessDetails";
import { useCallback, useMemo, useEffect } from "react";
import { useLogin } from "@store/useLogin";
import { useParams, useRouter } from "next/navigation";
import { useError } from "../store/useError";

interface ICreateJewelleryOrder {
  billValue: number;
  businessId: string;
  userId: string;
}

interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const useErrorHandler = () => {
  const setError = useError((s) => s.setError);
  const setOpenErrorModal = useError((s) => s.setOpenErrorModal);
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);

  return useCallback(
    (statusCode: number, message: string) => {
      switch (statusCode) {
        case 400:
          setError(message);
          setOpenErrorModal(true);
          toast.error(message || "Bad Request");
          break;
        case 404:
          setError(message);
          setOpenErrorModal(true);
          toast.error(message || "Not Found");
          break;
        case 403:
          setCheckLogin(true);
          toast.error("Authentication required");
          break;
        case 409:
          setError(message);
          setOpenErrorModal(true);
          toast.error(message || "Conflict Error");
          break;
        default:
          setError(message);
          setOpenErrorModal(true);
          toast.error(message || "An error occurred");
      }
    },
    [setError, setOpenErrorModal, setCheckLogin],
  );
};

export const useJewelleryOrderCreate = () => {
  const setOrderId = useOrderStore((s) => s.setOrderId);
  const saveOrderData = useOrderStore((s) => s.saveOrderData);
  const handleError = useErrorHandler();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: ICreateJewelleryOrder) => {
      const res = await apiRpc.jewellery.payments.orders.$post({
        json: payload,
      });
      return res;
    },
    onSuccess: async (data) => {
      try {
        const orderData = await data.json();

        if (data.status !== 200) {
          handleError(
            data.status,
            orderData.message || "Failed to create order",
          );
          return;
        }

        const { orderId, displayOrderId } = orderData.data;
        setOrderId(orderId, displayOrderId);
        saveOrderData(orderId, orderData.data);
        toast.success("Order created successfully");
      } catch (error) {
        console.error("Error processing order response:", error);
        toast.error("Failed to process order response");
      }
    },
    onError: (error) => {
      console.error("Order creation failed:", error);
      toast.error("Failed to create order. Please try again.");
    },
  });

  return { mutateAsync, isPending };
};

const fetchJewelleryOrder = async (orderId: string) => {
  try {
    const response = await apiRpc.jewellery.payments.orders.bill[
      ":orderId"
    ].$get({
      param: { orderId },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "An unknown error occurred" }));
      throw new Error(
        errorData.message ||
          `HTTP ${response.status}: Failed to fetch order details`,
      );
    }

    return response.json();
  } catch (error) {
    console.error("Fetch jewellery order error:", error);
    throw error;
  }
};

export const useGetJewelleryOrder = (orderId: string | null) => {
  const { saveOrderData } = useOrderStore();

  const { isLoading, data, isError, error, refetch } = useQuery({
    queryKey: ["jewelleryOrder", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const orderData = await fetchJewelleryOrder(orderId);
      if (orderData?.data) {
        saveOrderData(orderId, orderData.data);
      }
      return orderData;
    },
    enabled: !!orderId,
    staleTime: 5 * 60,
  });

  return {
    isLoading,
    data,
    isError,
    error,
    refetch,
  };
};

export const useCreateOnlineRazorPayOrder = () => {
  const merchantDetails = usePaymentStore((s) => s.merchantDetails);
  const handleError = useErrorHandler();

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }

      if (!merchantDetails?.razorpayMerchantId) {
        throw new Error("Merchant details not available");
      }

      const res = await apiRpc.jewellery.payments.orders[
        ":merchantId"
      ].pay_online.$post({
        param: {
          merchantId: merchantDetails.razorpayMerchantId,
        },
        json: { orderId },
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Unknown error" }));
        handleError(res.status, errorData.message);
        throw new Error(errorData.message || "Failed to create payment order");
      }

      const response = (await res.json()) as { data: { orderId: string } };
      return response.data.orderId;
    },
    onSuccess: (razorPayOrderId) => {
      console.log("Online Razorpay order created:", razorPayOrderId);
    },
    onError: (error) => {
      console.error("Razorpay order creation failed:", error);
      toast.error("Failed to create online payment order");
    },
  });
};

const fetchOrderStatus = async (orderId: string) => {
  try {
    const response = await apiRpc.jewellery.payments.webhooks.status[
      ":orderId"
    ].$get({
      param: { orderId },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "An unknown error occurred" }));
      throw new Error(
        errorData.message ||
          `HTTP ${response.status}: Failed to fetch order status`,
      );
    }
    console.log("Fetch order status response:", response);

    const data = await response.json();
    console.log("Fetch order status data:", data);
    return data.data.status;
  } catch (error) {
    console.error("Fetch order status error:", error);
    throw error;
  }
};

export const useOrderStatus = (orderId: string | null, enabled = false) => {
  const {
    isLoading,
    data: orderStatus,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orderStatus", orderId],
    queryFn: () => fetchOrderStatus(orderId as string),
    enabled: Boolean(orderId) && enabled,
    refetchInterval: 5000,
  });

  return { isLoading, orderStatus, isError, error, refetch };
};

export const usePaymentHandler = () => {
  const orderId = useOrderStore((s) => s.orderId);
  const status = useOrderStore((s) => s.status);
  const startChecking = useOrderStore((s) => s.startChecking);
  const setSuccess = useOrderStore((s) => s.setSuccess);
  const setFailed = useOrderStore((s) => s.setFailed);
  const clearAll = useOrderStore((s) => s.clearAll);
  const { orderStatus, isLoading: isCheckingStatus } = useOrderStatus(
    orderId,
    status === "CHECKING",
  );
  const handlePaymentResponse = useCallback(
    async (response: PaymentResponse) => {
      try {
        console.log("Payment response received:", response);
        startChecking();
      } catch (error) {
        toast.error("Payment processing failed");
      }
    },
    [startChecking],
  );

  useEffect(() => {
    if (!orderStatus) return;
    switch (String(orderStatus).toUpperCase()) {
      case "SUCCESS":
        toast.success("Order payment verified successfully");
        setSuccess();
        break;
      case "FAILED":
        toast.error("Payment verification failed");
        setFailed();
        break;
    }
  }, [orderStatus, setSuccess, setFailed]);

  return {
    handlePaymentResponse,
    isCheckingStatus,
    orderStatus,
  };
};

export const useRazorpayPayment = () => {
  const orderData = useOrderStore((s) => s.orderData);
  const merchantDetails = usePaymentStore((s) => s.merchantDetails);
  const businessDetails = useBusinessDetails((s) => s.businessDetails);
  const userDetails = useLogin((s) => s.userDetails);
  const params = useParams();
  const customLink = params?.businessId as string;
  const { handlePaymentResponse } = usePaymentHandler();

  const loadRazorpayScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      const timeoutId = setTimeout(() => {
        document.body.removeChild(script);
        reject(new Error("Failed to load Razorpay script"));
      }, 10000);

      script.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        document.body.removeChild(script);
        reject(new Error("Failed to load Razorpay script"));
      };
    });
  }, []);

  const createPaymentOptions = useMemo(() => {
    if (!orderData || !merchantDetails || !businessDetails || !userDetails) {
      return null;
    }

    return {
      key: merchantDetails.razorpayKeyId,
      amount: orderData.total,
      currency: "INR",
      name: businessDetails.name,
      description: "Jewellery Purchase",
      image: businessDetails.logoUrl,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      modal: {
        escape: false,
        backdropclose: false,
        handleback: false,
      },
      theme: {
        color: "#3399cc",
      },
    };
  }, [orderData, merchantDetails, businessDetails, userDetails]);

  const initiatePayment = useCallback(
    async (razorPayOrderId: string) => {
      if (!createPaymentOptions) {
        toast.error("Payment configuration incomplete");
        return;
      }

      try {
        await loadRazorpayScript();
        console.log("orderId", razorPayOrderId);

        const options = {
          ...createPaymentOptions,
          order_id: razorPayOrderId,
          handler: (response: PaymentResponse) => {
            handlePaymentResponse(response);
          },
          modal: {
            ...createPaymentOptions.modal,
            ondismiss: () => {
              toast.error("Payment cancelled");
              if (customLink) {
                window.location.href = `/${customLink}/payment`;
              }
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);

        const preventNavigation = (event: BeforeUnloadEvent) => {
          event.preventDefault();
          event.returnValue = "";
        };

        window.addEventListener("beforeunload", preventNavigation);

        rzp.on("payment.failed", () => {
          window.removeEventListener("beforeunload", preventNavigation);
          toast.error("Payment failed");
        });

        rzp.on("payment.success", () => {
          window.removeEventListener("beforeunload", preventNavigation);
        });

        rzp.open();
      } catch (error) {
        console.error("Payment initiation failed:", error);
        toast.error("Failed to initialize payment. Please try again.");
      }
    },
    [
      createPaymentOptions,
      handlePaymentResponse,
      loadRazorpayScript,
      customLink,
    ],
  );

  return { initiatePayment };
};

export const useJewelleryOnlinePaymentFlow = () => {
  const orderId = useOrderStore((s) => s.orderId);
  const { mutateAsync: createOnlineOrder, isPending } =
    useCreateOnlineRazorPayOrder();
  const { initiatePayment } = useRazorpayPayment();

  const handlePayment = useCallback(async () => {
    if (!orderId) {
      toast.error("No order found. Please create an order first.");
      return;
    }

    try {
      const razorPayOrderId = await createOnlineOrder(orderId);
      if (!razorPayOrderId) {
        toast.error("Failed to create payment order. Please try again.");
        return;
      }

      await initiatePayment(razorPayOrderId);
    } catch (error) {
      // Error handling is done in the mutation
      console.error("Payment flow failed:", error);
    }
  }, [orderId, createOnlineOrder, initiatePayment]);

  return { handlePayment, isPending };
};

export const useCreateOfflineRazorPayOrder = () => {
  const handleError = useErrorHandler();
  const clearAll = useOrderStore((s) => s.clearAll);
  const router = useRouter();
  const customLink = (useParams()?.businessId as string) || "";

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }

      const res = await apiRpc.jewellery.payments.orders.pay_offline.$post({
        json: { orderId },
      });

      if (res.status !== 200) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Unknown error" }));
        handleError(res.status, errorData.message);
        throw new Error(errorData.message || "Failed to create offline order");
      }

      const response = (await res.json()) as { data: { orderId: string } };
      return response.data.orderId;
    },
    onSuccess: (orderId) => {
      console.log("Offline Razorpay order created:", orderId);
      router.push(`/${customLink}/review`);
      clearAll();
      toast.success("Offline payment order created successfully");
    },
    onError: (error) => {
      console.error("Offline Razorpay order creation failed:", error);
      toast.error("Failed to create offline payment order");
    },
  });
};

export const useJewelleryOfflinePaymentFlow = () => {
  const orderId = useOrderStore((s) => s.orderId);
  const { mutateAsync: createOfflineOrder, isPending } =
    useCreateOfflineRazorPayOrder();

  const handleOfflinePayment = useCallback(async () => {
    if (!orderId) {
      toast.error("No order found. Please create an order first.");
      return;
    }

    try {
      await createOfflineOrder(orderId);
      toast.info("Please proceed to the counter to complete your payment.");
    } catch (error) {
      // Error handling is done in the mutation
      console.error("Offline payment flow failed:", error);
    }
  }, [orderId, createOfflineOrder]);

  return { handleOfflinePayment, isPending };
};
