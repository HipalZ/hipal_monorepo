"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { apiRpc } from "@hi/common";
import { useUserToken } from "@hi/common/src/useUserToken";
import type { IBusinessData } from "@/components/types/businessData";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useTableData, { resetTableData } from "@/components/store/useTableData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useMerchantDetails } from "@/components/hooks/useMerchantSecret";
import { useLogin } from "@/components/store/useLogin";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import Image from "next/image";
import hipalLoader from "@/assets/hipalLoader.png";

type SuccessState = { mode: "online" | "offline"; amount: number } | null;

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_SCRIPT_ID = "razorpay-checkout-script";
const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const ensureRazorpayScript = (() => {
  let promise: Promise<boolean> | null = null;

  return (): Promise<boolean> => {
    if (typeof window === "undefined") return Promise.resolve(false);

    if (window.Razorpay) return Promise.resolve(true);

    if (promise) return promise;

    promise = new Promise((resolve) => {
      const existing = document.getElementById(
        RAZORPAY_SCRIPT_ID
      ) as HTMLScriptElement | null;

      if (existing) {
        const onLoad = () => resolve(true);
        const onError = () => resolve(false);

        existing.addEventListener("load", onLoad, { once: true });
        existing.addEventListener("error", onError, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = RAZORPAY_SCRIPT_ID;
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });

    return promise;
  };
})();

const CustomPayPage = ({ data }: { data: IBusinessData }) => {
  const searchParams = useSearchParams();
  const tableNameFromUrl = searchParams?.get("tableName") || "";
  const userIdFromUrl = searchParams?.get("id") || "";

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessState>(null);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const [waitingForAutoLogin, setWaitingForAutoLogin] = useState(
    Boolean(userIdFromUrl)
  );

  const mountedRef = useRef(true);

  const setBusinessData = _useAllBusiness((s) => s.setData);
  const { setBusinessDetails } = useBusinessDetails();
  const setTableName = useTableData((s) => s.setTableName);
  const setTableNameTimeStamp = useTableData((s) => s.setTableNameTimeStamp);

  const { userDetails } = useLogin((s) => ({
    userDetails: s.userDetails,
  }));

  const { setCheckLogin, merchantDetails } = usePaymentStore((s) => ({
    setCheckLogin: s.setCheckLogin,
    merchantDetails: s.merchantDetails,
  }));

  const businessId = data?.outletInfo?.businessId || "";
  const business = data?.business;
  const numericAmount = useMemo(() => Number(amount) || 0, [amount]);

  useMerchantDetails(businessId);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Single initialization effect for business and table sync
  useEffect(() => {
    setBusinessData(data);

    if (data?.business) {
      setBusinessDetails(data.business);
    }

    if (tableNameFromUrl) {
      setTableName(tableNameFromUrl);
      setTableNameTimeStamp(Date.now());
    }
  }, [
    data,
    tableNameFromUrl,
    setBusinessData,
    setBusinessDetails,
    setTableName,
    setTableNameTimeStamp,
  ]);

  // Auth orchestration
  useEffect(() => {
    const accessToken = useUserToken.getState().accessToken;

    if (accessToken) {
      setWaitingForAutoLogin(false);
      return;
    }

    if (!userIdFromUrl) {
      setWaitingForAutoLogin(false);
      setCheckLogin(true);
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    intervalId = setInterval(() => {
      const token = useUserToken.getState().accessToken;
      if (token && mountedRef.current) {
        setWaitingForAutoLogin(false);
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
      }
    }, 300);

    timeoutId = setTimeout(() => {
      const token = useUserToken.getState().accessToken;
      if (!token && mountedRef.current) {
        setWaitingForAutoLogin(false);
        setCheckLogin(true);
      }
      if (intervalId) clearInterval(intervalId);
    }, 8000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userIdFromUrl, setCheckLogin]);

  // Razorpay preload
  useEffect(() => {
    let active = true;

    ensureRazorpayScript()
      .then((loaded) => {
        if (active && mountedRef.current) {
          setIsRazorpayReady(loaded);
        }
      })
      .catch(() => {
        if (active && mountedRef.current) {
          setIsRazorpayReady(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
    },
    []
  );

  const validatePayment = useCallback(
    async (response: any, payAmount: number, currentTableName: string) => {
      try {
        const res = await apiRpc.payments.validPayment[":merchantId"].$post({
          param: { merchantId: merchantDetails.razorpayMerchantId },
          json: { response },
          query: {
            userId: userDetails?._id,
            paidAmount: payAmount.toString(),
            tableName: currentTableName,
            businessId,
            netCoinz: "0",
          },
        });

        if (res.status === 200) {
          resetTableData();
          setSuccess({ mode: "online", amount: payAmount });
          return true;
        }

        toast.error("Payment verification failed.");
        return false;
      } catch (error) {
        console.error("Validate payment error:", error);
        toast.error("Payment verification failed.");
        return false;
      }
    },
    [merchantDetails.razorpayMerchantId, userDetails?._id, businessId]
  );

  const openRazorpayCheckout = useCallback(
    async (orderId: string, payAmount: number, currentTableName: string) => {
      const scriptLoaded = await ensureRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Failed to load payment gateway.");
        return;
      }

      const options = {
        key: merchantDetails.razorpayKeyId,
        order_id: orderId,
        currency: "INR",
        name: business?.name || "",
        description: "Payment",
        image: business?.logoUrl || "",
        handler: async (response: any) => {
          setLoading(true);
          await validatePayment(response, payAmount, currentTableName);
          if (mountedRef.current) setLoading(false);
        },
        prefill: {
          name: userDetails?.name || "",
          email: userDetails?.email || "",
          contact: userDetails?.phone || "",
        },
        modal: {
          escape: false,
          backdropclose: false,
          handleback: false,
          ondismiss: () => {
            toast.error("Payment cancelled");
          },
        },
        notes: {
          businessId,
          total: payAmount,
          billValue: payAmount,
          tableName: currentTableName,
        },
        theme: {
          color: "#111827",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", () => {
        toast.error("Payment failed");
      });

      razorpay.open();
    },
    [
      merchantDetails.razorpayKeyId,
      business?.name,
      business?.logoUrl,
      userDetails?.name,
      userDetails?.email,
      userDetails?.phone,
      businessId,
      validatePayment,
    ]
  );

  const handleOnlinePay = async (payAmount: number) => {
    try {
      setLoading(true);

      const currentTableName = useTableData.getState().tableName;

      const res = await apiRpc.payments.createOrder[":merchantId"].$post({
        param: { merchantId: merchantDetails.razorpayMerchantId },
        json: {
          businessId,
          total: payAmount,
          currency: "INR",
          claimedCoins: 0,
          billValue: payAmount,
          userId: userDetails?._id,
          tips: 0,
          tableName: currentTableName,
          cashbackAvailable: false,
        },
      });

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        setCheckLogin(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        toast.error(errBody?.message || "Failed to create order.");
        setLoading(false);
        return;
      }

      const orderRes = (await res.json()) as { data: { order_id: string } };
      const orderId = orderRes?.data?.order_id;

      if (!orderId) {
        toast.error("Order creation failed.");
        setLoading(false);
        return;
      }

      setLoading(false);
      await openRazorpayCheckout(orderId, payAmount, currentTableName);
    } catch (error) {
      console.error("Online payment error:", error);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleOfflinePay = useCallback(
    async (payAmount: number) => {
      try {
        setLoading(true);

        const currentTableName = useTableData.getState().tableName;

        const res = await apiRpc.payments.createOfflineOrder.$post({
          json: {
            businessId,
            total: payAmount,
            claimedCoins: 0,
            billValue: payAmount,
            userId: userDetails?._id,
            tips: 0,
            currency: "INR",
            tableName: currentTableName,
            cashbackAvailable: false,
          },
        });

        if (res.status === 401) {
          toast.error("Session expired. Please login again.");
          setCheckLogin(true);
          if (mountedRef.current) setLoading(false);
          return;
        }

        const response = (await res.json()) as {
          data?: { order_id?: string };
          message?: string;
        };

        if (res.status === 400) {
          toast.error(response?.message || "Payment failed.");
          if (mountedRef.current) setLoading(false);
          return;
        }

        if (response?.data?.order_id) {
          resetTableData();
          setSuccess({ mode: "offline", amount: payAmount });
        } else {
          toast.error("Offline order creation failed.");
        }

        if (mountedRef.current) setLoading(false);
      } catch (error) {
        console.error("Offline payment error:", error);
        toast.error("Something went wrong. Please try again.");
        if (mountedRef.current) setLoading(false);
      }
    },
    [businessId, userDetails?._id, setCheckLogin]
  );

  const handlePay = useCallback(
    (mode: "online" | "offline") => {
      const payAmount = Number(amount);
      const accessToken = useUserToken.getState().accessToken;
      const currentTableName = useTableData.getState().tableName;

      if (!payAmount || payAmount <= 0) {
        toast.error("Enter a valid amount");
        return;
      }

      if (!accessToken) {
        setCheckLogin(true);
        toast.error("Please login to continue");
        return;
      }

      if (!currentTableName) {
        toast.error("Invalid session. Please scan the QR again.");
        return;
      }

      if (mode === "online") {
        void handleOnlinePay(payAmount);
        return;
      }

      void handleOfflinePay(payAmount);
    },
    [amount, setCheckLogin, handleOnlinePay, handleOfflinePay]
  );

  if (waitingForAutoLogin) {
    return <LoadingSpinnerCircle />;
  }

  if (success) {
    const isOnline = success.mode === "online";

    return (
      <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-[#F5EBDD] px-6 font-sans text-[#1F2937]">
        <div className="w-full max-w-sm rounded-[28px] border border-[#E7DDD2] bg-white/60 px-6 py-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F1E7DB]">
              <svg
                className="h-10 w-10 text-[#1F2937]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={isOnline ? "M5 13l4 4L19 7" : "M12 8v4m0 4h.01"}
                />
              </svg>
            </div>

            <p className="text-4xl font-semibold tracking-tight text-[#2B2118]">
              ₹{success.amount.toFixed(2)}
            </p>

            <div className="text-center">
              <p className="text-lg font-semibold text-[#1F2937]">
                {isOnline ? "Payment Successful" : "Please Pay at the Counter"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                {isOnline
                  ? "Thank you for your payment."
                  : "Show this screen to the staff to complete your payment. The staff has been notified."}
              </p>
            </div>
          </div>
        </div>

        <p className="absolute bottom-6 text-[10px] tracking-[0.22em] text-[#9CA3AF]">
          Powered by Hipalz
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-[#F5EBDD] font-sans text-[#1F2937]">
        <section className="relative flex flex-col items-center justify-start">
          <div
            className="hipal_loader"
            style={{
              position: "relative",
              left: "auto",
              top: "auto",
              transform: "none",
            }}
          >
            <Image
              width={210}
              height={210}
              src={hipalLoader}
              alt="processing"
            />
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">Processing</p>
            <p className="mt-2 text-sm text-[#6B7280]">
              Please wait while we process your payment.
            </p>
          </div>
        </section>
        <p className="absolute bottom-6 text-[10px] tracking-[0.22em] text-[#9CA3AF]">
          Powered by Hipalz
        </p>
      </main>
    );
  }

  return (
    <main className="relative flex h-screen flex-col items-center bg-[#F5EBDD] font-sans">
      <header className="flex w-full flex-col items-center gap-3 px-6 pb-8 pt-12">
        {business?.logoUrl ? (
          <img
            src={business.logoUrl}
            alt={business?.name || ""}
            className="h-16 w-16 rounded-full border border-[#E7DDD2] object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE3D7] text-lg font-semibold text-[#1F2937] shadow-sm">
            {business?.name?.[0] || "P"}
          </div>
        )}

        <h1 className="text-xl font-semibold tracking-tight text-[#1F2937]">
          {business?.name || "Payment"}
        </h1>
      </header>

      <section className="mt-4 flex w-full max-w-sm flex-col items-center gap-2 px-6">
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-[#6B7280]">
          Amount
        </span>

        <div className="w-full rounded-[28px] border border-[#E7DDD2] bg-white/50 px-6 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <div className="flex w-full items-baseline justify-center gap-1">
            <span className="text-3xl font-light text-[#6B7280]">₹</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              className="w-full appearance-none bg-transparent text-center text-5xl font-semibold tracking-tight text-[#2B2118] outline-none placeholder:text-[#C7B9AA] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      </section>

      <section className="mt-10 flex w-full max-w-sm flex-col gap-3 px-6">
        <button
          type="button"
          onClick={() => handlePay("online")}
          disabled={
            loading ||
            numericAmount <= 0 ||
            !merchantDetails?.razorpayMerchantId ||
            !merchantDetails?.razorpayKeyId ||
            !isRazorpayReady
          }
          className="w-full rounded-full bg-[#111827] py-4 text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:opacity-90 disabled:opacity-30"
        >
          Pay Online
        </button>

        <button
          type="button"
          onClick={() => handlePay("offline")}
          disabled={loading || numericAmount <= 0}
          className="w-full rounded-full border border-[#D6C7B8] bg-transparent py-4 text-sm font-medium uppercase tracking-[0.16em] text-[#1F2937] transition hover:bg-white/60 disabled:opacity-30"
        >
          Pay at Counter
        </button>
      </section>

      <p className="mt-auto py-6 text-[10px] tracking-[0.22em] text-[#9CA3AF]">
        Powered by Hipalz
      </p>
    </main>
  );
};

export default memo(CustomPayPage);
