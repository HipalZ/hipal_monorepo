"use client";

import { memo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
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



const CustomPayPage = ({ data }: { data: IBusinessData }) => {
  const searchParams = useSearchParams();
  const tableNameFromUrl = searchParams?.get("tableName") || "";
  const userIdFromUrl = searchParams?.get("id");

  // Razorpay Payment Link callback — redirects here with ?paymentStatus=success
  const paymentStatusFromUrl = searchParams?.get("paymentStatus");
  const amountFromUrl = searchParams?.get("amount");

  const [amount, setAmount] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessState>(
    paymentStatusFromUrl === "success" && amountFromUrl
      ? { mode: "online", amount: Number(amountFromUrl) }
      : null,
  );
  const [waitingForAutoLogin, setWaitingForAutoLogin] = useState(
    !!userIdFromUrl,
  );

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

  useMerchantDetails(businessId);

  // ── Force-close any popup SYNCHRONOUSLY before first paint ──
  // DynamicCombinedLogin (root layout) renders BottomPopUp when
  // checkLogin=true, covering the entire screen with a grey overlay.
  // This can be triggered by: auth hydration race, global 401 handler,
  // or hash changes during Razorpay redirect. Kill it on every render.
  if (typeof window !== "undefined") {
    // Synchronous — runs before React commits to DOM
    usePaymentStore.getState().setCheckLogin(false);
    if (window.location.hash === "#popup") {
      history.replaceState(
        "",
        document.title,
        window.location.pathname + window.location.search,
      );
    }
  }

  // ── Payment callback: show success immediately, skip everything else ──
  // When Razorpay redirects back with ?paymentStatus=success, we're back
  // inside the WhatsApp WebView. If we let the normal flow run, the auth
  // hydration race triggers the login popup overlay (blank screen).
  // Short-circuit: render success screen before any effects execute.
  if (paymentStatusFromUrl === "success" && amountFromUrl) {
    return (
      <main className="relative flex min-h-[100dvh] flex-col items-center bg-[#F5EBDD] px-6 pt-12 font-sans text-[#1F2937]">
        <header className="flex flex-col items-center gap-2 pb-8">
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
          <h1 className="text-lg font-semibold tracking-tight text-[#1F2937]">
            {business?.name || "Payment"}
          </h1>
        </header>

        <div className="w-full max-w-sm rounded-[28px] border border-[#E7DDD2] bg-white/60 px-6 py-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DEF7EC]">
              <svg
                className="h-10 w-10 text-[#059669]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-4xl font-semibold tracking-tight text-[#2B2118]">
              &#8377;{Number(amountFromUrl).toFixed(2)}
            </p>
            <div className="text-center">
              <p className="text-lg font-semibold text-[#1F2937]">
                Payment Successful
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                {`Paid to ${business?.name || "the merchant"}. Thank you!`}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-auto py-6 text-[10px] tracking-[0.22em] text-[#9CA3AF]">
          Powered by Hipalz
        </p>
      </main>
    );
  }


  // ── Effect 1: Initialise stores + table ──
  useEffect(() => {
    setBusinessData(data);
    if (data?.business) {
      setBusinessDetails(data.business);
    }
    if (tableNameFromUrl) {
      setTableName(tableNameFromUrl);
      setTableNameTimeStamp(Date.now());
    }
    setIsReady(true);
  }, [data, setBusinessData, setBusinessDetails, tableNameFromUrl, setTableName, setTableNameTimeStamp]);

  // ── Effect 3: Auth — wait for Zustand hydration before checking token ──
  // On page load, getState().accessToken is "" until persist middleware
  // rehydrates from localStorage. Checking too early triggers the
  // BottomPopUp login overlay which covers the entire screen.
  useEffect(() => {
    let cancelled = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;

    const checkAuth = () => {
      if (cancelled) return;
      const accessToken = useUserToken.getState().accessToken;

      if (accessToken) {
        setWaitingForAutoLogin(false);
        return;
      }

      if (!userIdFromUrl) {
        setCheckLogin(true);
        setWaitingForAutoLogin(false);
        return;
      }

      // ?id= param present — AutoLoginWrapper is handling it, poll for token
      pollInterval = setInterval(() => {
        if (useUserToken.getState().accessToken) {
          setWaitingForAutoLogin(false);
          if (pollInterval) clearInterval(pollInterval);
        }
      }, 300);

      fallbackTimeout = setTimeout(() => {
        if (pollInterval) clearInterval(pollInterval);
        if (!useUserToken.getState().accessToken) {
          setWaitingForAutoLogin(false);
          setCheckLogin(true);
        }
      }, 8000);
    };

    if (useUserToken.persist?.hasHydrated?.()) {
      checkAuth();
    } else {
      const unsub = useUserToken.persist.onFinishHydration(() => {
        unsub();
        checkAuth();
      });
      return () => {
        cancelled = true;
        unsub();
      };
    }

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [userIdFromUrl, setCheckLogin]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  // ── Online payment via Razorpay Payment Link (hosted page) ──
  // Creates a payment link on Razorpay's servers and redirects the user
  // to Razorpay's hosted payment page. This works in ANY browser/WebView
  // because the payment happens on Razorpay's domain, not ours.
  // After payment, Razorpay redirects to our callback URL with the result.
  const handleOnlinePay = async (payAmount: number) => {
    try {
      if (loading) {
        return toast.error(
          "Please wait for the previous transaction to complete",
        );
      }
      setLoading(true);

      const currentTableName = useTableData.getState().tableName;
      const customLink = window.location.pathname.split("/")[1] || "";

      // Build callback URL — Razorpay redirects here after payment
      const callbackUrl = `${window.location.origin}/${customLink}/custompayment?paymentStatus=success&amount=${payAmount}&tableName=${currentTableName || ""}`;

      const res = await apiRpc.payments.createPaymentLink[":merchantId"].$post({
        param: { merchantId: merchantDetails.razorpayMerchantId },
        json: {
          businessId,
          total: payAmount,
          currency: "INR",
          userId: userDetails?._id,
          tableName: currentTableName,
          callbackUrl,
          customerName: userDetails?.name || "",
          customerPhone: userDetails?.phone || "",
          customerEmail: userDetails?.email || "",
          description: `Payment to ${business?.name || "merchant"}`,
        },
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        toast.error(errBody?.message || "Failed to create payment link.");
        setLoading(false);
        return;
      }

      const linkRes = (await res.json()) as {
        data: { short_url: string; payment_link_id: string };
      };
      const shortUrl = linkRes?.data?.short_url;

      if (!shortUrl) {
        toast.error("Payment link creation failed.");
        setLoading(false);
        return;
      }

      // Kill ALL popups before redirecting — BottomPopUp's hashchange
      // listener and the global 401 handler can trigger the login overlay
      // during navigation, causing the blank screen the user sees.
      setCheckLogin(false);
      if (window.location.hash === "#popup") {
        history.replaceState(
          "",
          document.title,
          window.location.pathname + window.location.search,
        );
      }

      // Redirect to Razorpay's hosted payment page
      window.location.href = shortUrl;
    } catch (error) {
      console.error("Online payment error:", error);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleOfflinePay = async (payAmount: number) => {
    try {
      if (loading) {
        return toast.error(
          "Please wait for the previous transaction to complete",
        );
      }
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
        setLoading(false);
        return;
      }

      const response = (await res.json()) as {
        data?: { order_id?: string };
        message?: string;
      };

      if (res.status === 400) {
        toast.error(response?.message || "Payment failed.");
        setLoading(false);
        return;
      }

      if (response?.data?.order_id) {
        resetTableData();
        setSuccess({ mode: "offline", amount: payAmount });
      } else {
        toast.error("Offline order creation failed.");
      }

      setLoading(false);
    } catch (error) {
      console.error("Offline payment error:", error);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handlePay = (mode: "online" | "offline") => {
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
      handleOnlinePay(payAmount);
      return;
    }

    handleOfflinePay(payAmount);
  };

  const handleNewPayment = () => {
    setSuccess(null);
    setAmount("");

    if (tableNameFromUrl) {
      setTableName(tableNameFromUrl);
      setTableNameTimeStamp(Date.now());
    }
  };

  const numericAmount = Number(amount) || 0;

  if (!isReady || waitingForAutoLogin) {
    return <LoadingSpinnerCircle />;
  }

  if (success) {
    const isOnline = success.mode === "online";

    return (
      <main className="relative flex min-h-[100dvh] flex-col items-center bg-[#F5EBDD] px-6 pt-12 font-sans text-[#1F2937]">
        <header className="flex flex-col items-center gap-2 pb-8">
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
          <h1 className="text-lg font-semibold tracking-tight text-[#1F2937]">
            {business?.name || "Payment"}
          </h1>
        </header>

        <div className="w-full max-w-sm rounded-[28px] border border-[#E7DDD2] bg-white/60 px-6 py-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full ${
                isOnline ? "bg-[#DEF7EC]" : "bg-[#FEF3C7]"
              }`}
            >
              <svg
                className={`h-10 w-10 ${isOnline ? "text-[#059669]" : "text-[#D97706]"}`}
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
              &#8377;{success.amount.toFixed(2)}
            </p>

            <div className="text-center">
              <p className="text-lg font-semibold text-[#1F2937]">
                {isOnline ? "Payment Successful" : "Please Pay at the Counter"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                {isOnline
                  ? `Paid to ${business?.name || "the merchant"}. Thank you!`
                  : "Show this screen to the staff to complete your payment. The staff has been notified."}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNewPayment}
          className="mt-8 w-full max-w-sm rounded-full border border-[#D6C7B8] bg-white/60 py-4 text-sm font-medium uppercase tracking-[0.16em] text-[#1F2937] transition hover:bg-white/80 active:scale-[0.98]"
        >
          Make Another Payment
        </button>

        <p className="mt-auto py-6 text-[10px] tracking-[0.22em] text-[#9CA3AF]">
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
            <span className="text-3xl font-light text-[#6B7280]">&#8377;</span>
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
            !merchantDetails?.razorpayKeyId
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
