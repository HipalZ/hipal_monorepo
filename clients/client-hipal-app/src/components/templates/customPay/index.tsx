"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
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

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Detect any in-app browser (WhatsApp, Instagram, Facebook, etc.)
function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /WhatsApp|FBAN|FBAV|Instagram|Line|Snapchat|Twitter|MicroMessenger/i.test(ua);
}

// Open the current URL in the device's default external browser.
// Uses multiple strategies — Android intent with fallback to any browser,
// iOS googlechrome:// scheme, and window.open as last resort.
function openInExternalBrowser() {
  if (typeof window === "undefined") return;
  const url = window.location.href;
  const urlWithoutScheme = url.replace(/^https?:\/\//, "");
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (isIOS) {
    // iOS: try Safari via window.open (WhatsApp WebView on iOS
    // respects window.open as an external browser open in most cases)
    window.open(url, "_system") || window.open(url, "_blank");
    return;
  }

  // Android: intent URL — tries Chrome first, falls back to any browser
  // S.browser_fallback_url ensures that if Chrome isn't installed, the
  // device's default browser opens the URL instead of showing an error.
  const intentUrl =
    `intent://${urlWithoutScheme}` +
    `#Intent;scheme=https;` +
    `package=com.android.chrome;` +
    `S.browser_fallback_url=${encodeURIComponent(url)};` +
    `end`;
  window.location.href = intentUrl;
}

const CustomPayPage = ({ data }: { data: IBusinessData }) => {
  const searchParams = useSearchParams();
  const tableNameFromUrl = searchParams?.get("tableName") || "";
  const userIdFromUrl = searchParams?.get("id");

  const [amount, setAmount] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [redirectingToBrowser, setRedirectingToBrowser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessState>(null);
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

  // ── Auto-redirect: escape WhatsApp / in-app browser ──
  // In-app WebViews freeze JS during UPI app switch, causing blank screens
  // and popup overlays. Opening in the real browser fixes all of it.
  useEffect(() => {
    if (isInAppBrowser()) {
      setRedirectingToBrowser(true);
      openInExternalBrowser();
    }
  }, []);

  // Redirect screen — shown briefly while the external browser opens.
  // Includes a manual "Open in Browser" button as fallback if the
  // auto-redirect doesn't work on the user's device.
  if (redirectingToBrowser) {
    return (
      <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-[#F5EBDD] px-6 font-sans text-[#1F2937]">
        <div className="flex flex-col items-center gap-5 text-center">
          {business?.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business?.name || ""}
              className="h-20 w-20 rounded-full border border-[#E7DDD2] object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDE3D7] text-xl font-semibold text-[#1F2937] shadow-sm">
              {business?.name?.[0] || "P"}
            </div>
          )}

          <div>
            <p className="text-xl font-semibold text-[#1F2937]">
              {business?.name || "Payment"}
            </p>
            <p className="mt-2 text-sm text-[#6B7280]">
              Opening in your browser for a secure payment experience...
            </p>
          </div>

          <button
            type="button"
            onClick={() => openInExternalBrowser()}
            className="mt-4 w-full max-w-xs rounded-full bg-[#111827] py-4 text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            Open in Browser
          </button>

          <p className="mt-2 text-xs text-[#9CA3AF]">
            Tap the button above if your browser didn&apos;t open automatically
          </p>
        </div>
      </main>
    );
  }

  // ── Pending payment tracker ──
  // Stored in a ref so it survives WebView freeze/unfreeze without re-render.
  // When user returns from UPI app, visibilitychange reads this to recover.
  const pendingPaymentRef = useRef<{
    orderId: string;
    payAmount: number;
    tableName: string;
  } | null>(null);

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

  // ── Effect 2: Visibility handler ──
  // This is the ONLY mechanism that works across regular browsers AND WhatsApp
  // WebView. It handles two scenarios:
  //
  // A) User returns from UPI app → WebView was frozen → Razorpay handler may
  //    not have fired → we detect pendingPaymentRef and validate with backend.
  //
  // B) User re-clicks WhatsApp CTA after a completed payment → stale success
  //    screen is showing → we reset to fresh form.
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState !== "visible") return;

      // FIRST: kill any popup overlay immediately.
      // BottomPopUp sets window.location.hash = "#popup" and renders a
      // full-screen grey overlay (z-110, backdrop-blur). Razorpay / UPI
      // redirects can dirty the hash, and the global 401 handler in
      // helper.ts can re-trigger setCheckLogin(true). Force everything
      // closed before we do anything else.
      setCheckLogin(false);
      if (window.location.hash === "#popup") {
        history.replaceState(
          "",
          document.title,
          window.location.pathname + window.location.search,
        );
      }

      // Scenario A: returning from UPI with a pending payment
      const pending = pendingPaymentRef.current;
      if (pending) {
        // Give Razorpay handler 1.5s to fire on its own
        await new Promise((r) => setTimeout(r, 1500));

        // If Razorpay handler already handled it, ref will be null
        if (!pendingPaymentRef.current) return;

        // Razorpay handler didn't fire (WebView froze it) — validate
        pendingPaymentRef.current = null;
        setLoading(true);
        try {
          const res = await apiRpc.payments.validPayment[":merchantId"].$post({
            param: { merchantId: merchantDetails.razorpayMerchantId },
            json: { response: { razorpay_order_id: pending.orderId } },
            query: {
              userId: userDetails?._id,
              paidAmount: pending.payAmount.toString(),
              tableName: pending.tableName,
              businessId,
              netCoinz: "0",
            },
          });
          if (res.status === 200) {
            resetTableData();
            setSuccess({ mode: "online", amount: pending.payAmount });
          } else {
            toast.error(
              "Payment status unclear. Please check with the staff.",
            );
          }
        } catch {
          toast.error("Could not verify payment. Please check with the staff.");
        } finally {
          setLoading(false);
        }
        return;
      }

      // Scenario B: stale success — user revisited via WhatsApp CTA
      if (success) {
        setSuccess(null);
        setLoading(false);
        setAmount("");
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [success, merchantDetails?.razorpayMerchantId, userDetails?._id, businessId, setCheckLogin]);

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

  // ── Razorpay script loader — on-demand only ──
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    if (typeof window === "undefined") return Promise.resolve(false);
    if (window.Razorpay) return Promise.resolve(true);

    return new Promise((resolve) => {
      let loaded = false;
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      const timeout = setTimeout(() => {
        if (!loaded) {
          toast.error("Facing Internet Issue! Please try again.");
          document.body.removeChild(script);
          resolve(false);
        }
      }, 5000);

      script.onload = () => {
        loaded = true;
        clearTimeout(timeout);
        resolve(true);
      };
      script.onerror = () => {
        clearTimeout(timeout);
        toast.error("Failed to load Razorpay. Please try again later.");
        resolve(false);
      };
    });
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  // ── Payment validation ──
  const validatePayment = async (
    response: any,
    payAmount: number,
    currentTableName: string,
  ) => {
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
  };

  // ── Razorpay checkout ──
  const openRazorpayCheckout = useCallback(
    async (orderId: string, payAmount: number, currentTableName: string) => {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Failed to load payment gateway.");
        setLoading(false);
        return;
      }

      // Force-close any popup overlay and clean its hash BEFORE opening
      // Razorpay. BottomPopUp sets window.location.hash = "#popup" — if
      // that hash survives into the UPI redirect, the hashchange listener
      // can re-trigger the overlay when the user returns.
      setCheckLogin(false);
      if (window.location.hash === "#popup") {
        history.replaceState(
          "",
          document.title,
          window.location.pathname + window.location.search,
        );
      }

      const options = {
        key: merchantDetails.razorpayKeyId,
        amount: payAmount,
        order_id: orderId,
        currency: "INR",
        name: business?.name || "",
        description: "Payment",
        image: business?.logoUrl || "",
        handler: (response: any) => {
          // Razorpay handler fired — clear pending so visibilitychange skips
          pendingPaymentRef.current = null;
          setLoading(true);
          validatePayment(response, payAmount, currentTableName).finally(() => {
            setLoading(false);
          });
        },
        prefill: {
          name: userDetails?.name || "",
          email: userDetails?.email || "",
          contact: userDetails?.phone || "",
        },
        modal: {
          subscription_card_change: true,
          remember_customer: true,
          escape: false,
          backdropclose: false,
          handleback: false,
          ondismiss: () => {
            pendingPaymentRef.current = null;
            setLoading(false);
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

      // Set pending BEFORE opening — visibilitychange will use this to
      // recover if the Razorpay handler doesn't fire (WebView freeze)
      pendingPaymentRef.current = {
        orderId,
        payAmount,
        tableName: currentTableName,
      };

      razorpay.on("payment.failed", () => {
        pendingPaymentRef.current = null;
        setLoading(false);
        toast.error("Payment failed");
      });

      razorpay.open();
    },
    [
      loadRazorpayScript,
      merchantDetails.razorpayKeyId,
      business?.name,
      business?.logoUrl,
      userDetails?.name,
      userDetails?.email,
      userDetails?.phone,
      businessId,
      setCheckLogin,
    ],
  );

  const handleOnlinePay = async (payAmount: number) => {
    try {
      if (loading) {
        return toast.error(
          "Please wait for the previous transaction to complete",
        );
      }
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
