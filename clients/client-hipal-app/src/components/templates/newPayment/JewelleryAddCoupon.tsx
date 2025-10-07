import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Check,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  XCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import BottomPopUp from "../../atoms/bottomPopUp";
import { useLogin } from "../../store/useLogin";
import { _useAllBusiness } from "../../store/useAllBusiness";
import useUserCouponz from "../../hooks/useUserCouponz";
import { useOrderStore } from "../../store/useOrder";
import type { Coupon } from "../../types/businessData";
import {
  formatDate,
  formatTime,
  getAvailabilityText,
} from "@/components/utils/helpers";
import {
  useApplyJewelleryCoupon,
  useRemoveJewelleryCoupon,
} from "../../hooks/jewellery/useJewelleryCoupon";
import {
  useApplyJewelleryCoinz,
  useRemoveJewelleryCoinz,
} from "../../hooks/jewellery/useCoinz";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CouponBottomPopup({ open, onClose }: Props) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // When coins are already applied and user clicks Apply on a coupon,
  // we pop a small inline “Proceed?” confirmation.
  const [coinConflictOpen, setCoinConflictOpen] = useState(false);
  const [pendingCoupon, setPendingCoupon] = useState<Coupon | null>(null);

  const userDetails = useLogin((s) => s.userDetails);
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const currencySymbol = outletInfo?.currencySymbol || "₹";

  const orderData = useOrderStore((s) => s.orderData);
  const orderId = orderData?._id || "";
  const orderTotal = Number(orderData?.total ?? 0);
  const currentCouponId = orderData?.couponId || null;
  const claimedCoins = Number(orderData?.claimedCoins ?? 0);

  const { applyJewelleryCoupon, isApplyingCoupon } = useApplyJewelleryCoupon();
  const { removeJewelleryCoupon, isRemovingCoupon } =
    useRemoveJewelleryCoupon();

  const { removeJewelleryCoinz, isRemovingCoinz } = useRemoveJewelleryCoinz();

  const {
    couponData,
    isLoading,
    error: couponError,
  } = useUserCouponz(outletInfo.businessId, userDetails._id);

  const safeCoupons: Coupon[] = useMemo(
    () => (Array.isArray(couponData) ? couponData : []),
    [couponData],
  );

  // ---------------- Helpers ----------------

  const normalizeTc = useCallback((tcField: unknown): string[] => {
    if (!tcField) return [];
    if (Array.isArray(tcField)) return tcField.map(String);
    if (typeof tcField === "string") {
      return tcField.includes("\n")
        ? tcField
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [tcField];
    }
    return [];
  }, []);

  const calcDiscount = useCallback(
    (coupon: Coupon): number => {
      const cfg = coupon?.config;
      if (!cfg) return 0;
      const typ = (cfg.discountType || "").toUpperCase();

      if (typ === "PERCENTAGE") {
        const raw = (orderTotal * (cfg.value || 0)) / 100;
        const capped = cfg.upto ? Math.min(raw, cfg.upto) : raw;
        return Math.max(0, Math.floor(capped));
      }
      // AMOUNT (flat)
      return Math.max(0, Math.floor(cfg.value || 0));
    },
    [orderTotal],
  );

  const isWithinDateWindow = useCallback((start: number, end: number) => {
    const now = Date.now();
    if (!start && !end) return true;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }, []);

  const isWithinTimeWindow = useCallback(
    (startTime: number, endTime: number) => {
      if (startTime == null && endTime == null) return true;
      const now = new Date();
      const current = now.getHours() + now.getMinutes() / 60;
      const st = typeof startTime === "number" ? startTime : 0;
      const en = typeof endTime === "number" ? endTime : 24;
      if (st <= en) return current >= st && current <= en;
      return current >= st || current <= en; // cross-midnight
    },
    [],
  );

  const isAllowedToday = useCallback((when: string, customDays: string[]) => {
    if ((when || "").toLowerCase() === "allthetime") return true;
    if (Array.isArray(customDays) && customDays.length > 0) {
      const map = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return customDays.includes(map[new Date().getDay()]);
    }
    return true;
  }, []);

  const isCouponEligible = useCallback(
    (coupon: Coupon) => {
      if (!coupon) return { ok: false, reason: "Invalid coupon" };
      if (coupon.isDeleted)
        return { ok: false, reason: "Coupon not available" };
      if (!coupon.isActive) return { ok: false, reason: "Coupon is inactive" };
      if (coupon.visiable === false)
        return { ok: false, reason: "Coupon is hidden" };

      // date window
      const start = coupon?.conditions?.couponStartDate || 0;
      const end = coupon?.conditions?.couponEndDate || 0;
      if (!isWithinDateWindow(start, end)) {
        const till = end ? formatDate(end) : undefined;
        return {
          ok: false,
          reason: till
            ? `Coupon not valid currently (valid till ${till})`
            : "Coupon not valid currently",
        };
      }

      const avail = coupon?.conditions?.availability;
      if (avail) {
        if (!isAllowedToday(avail.when, avail.customDays || [])) {
          return { ok: false, reason: "Not valid today" };
        }
        if (!isWithinTimeWindow(avail.startTime, avail.endTime)) {
          return {
            ok: false,
            reason: `Valid only between ${formatTime(
              avail.startTime,
            )} - ${formatTime(avail.endTime)}`,
          };
        }
      }

      const minBill = coupon.conditions?.billValue || 0;
      if (orderTotal < minBill) {
        return {
          ok: false,
          reason: `Minimum order ${currencySymbol}${minBill.toLocaleString()} required`,
        };
      }

      const discount = calcDiscount(coupon);
      if (discount <= 0) return { ok: false, reason: "No discount applicable" };

      return { ok: true as const, discount };
    },
    [
      orderTotal,
      currencySymbol,
      calcDiscount,
      isAllowedToday,
      isWithinTimeWindow,
      isWithinDateWindow,
    ],
  );

  // ---------------- Confetti (success page only) ----------------

  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#FF69B4", "#00CED1"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#FF69B4", "#00CED1"],
      });
    }, 250);
  }, []);
  // ---------------- Core flows ----------------

  // INTERNAL: actually call apply hook and show success
  const applyCouponInternal = useCallback(
    async (coupon: Coupon, fallbackDiscount: number) => {
      const { status, body } = await applyJewelleryCoupon({
        couponId: coupon._id,
        orderId,
      });

      if (status === 200 || status === 201) {
        const saved =
          Number(body?.data?.couponDiscount) ||
          Number(orderData?.couponDiscount) ||
          fallbackDiscount;

        setAppliedDiscount(Math.max(0, Math.floor(saved)));
        setShowSuccess(true);
        triggerConfetti();
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 3000);
      }
    },
    [
      applyJewelleryCoupon,
      orderId,
      triggerConfetti,
      onClose,
      orderData?.couponDiscount,
    ],
  );

  // EXTERNAL handle: entry point when user taps Apply on a coupon card
  const handleApplyClick = useCallback(
    async (coupon: Coupon) => {
      if (!orderId) return;

      // enforce exclusive: if coins already claimed, ask to proceed
      if (claimedCoins > 0) {
        setPendingCoupon(coupon);
        setCoinConflictOpen(true);
        return;
      }

      // also allow replacing an already-applied coupon: remove and apply new
      if (currentCouponId && currentCouponId !== coupon._id) {
        await removeJewelleryCoupon({ orderId });
        // proceed to apply new coupon afterwards
      }

      const eligibility = isCouponEligible(coupon);
      if (!eligibility.ok) return;

      await applyCouponInternal(coupon, eligibility.discount!);
    },
    [
      orderId,
      currentCouponId,
      claimedCoins,
      removeJewelleryCoupon,
      isCouponEligible,
      applyCouponInternal,
    ],
  );

  // Confirm “Proceed” from the coin conflict banner: remove coins, then apply pending coupon
  const proceedAfterRemovingCoins = useCallback(async () => {
    if (!orderId || !pendingCoupon) return;
    // remove coins first
    const { status } = await removeJewelleryCoinz({ orderId });
    if (status === 200 || status === 201) {
      // then apply the pending coupon
      const eligibility = isCouponEligible(pendingCoupon);
      if (eligibility.ok) {
        await applyCouponInternal(pendingCoupon, eligibility.discount!);
      }
    }
    setCoinConflictOpen(false);
    setPendingCoupon(null);
  }, [
    orderId,
    pendingCoupon,
    removeJewelleryCoinz,
    isCouponEligible,
    applyCouponInternal,
  ]);

  const cancelCoinConflict = useCallback(() => {
    setCoinConflictOpen(false);
    setPendingCoupon(null);
  }, []);

  const handleRemoveCoupon = useCallback(async () => {
    if (!orderId) return;
    await removeJewelleryCoupon({ orderId });
  }, [orderId, removeJewelleryCoupon]);

  return (
    <BottomPopUp
      height={showSuccess ? "60dvh" : "100dvh"}
      show={open}
      rightTopBack
      hide
      onClose={onClose}
    >
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="coupon-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 space-y-6 bg-white pb-24 h-[90dvh] overflow-auto hide-scrollbar"
          >
            <div className="sticky bg-white pt-4 pb-3 z-50 top-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <motion.div
                    className="p-2 h-[2.5rem] w-[2.5rem] bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl"
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: 3,
                    }}
                  >
                    <Tag className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Apply Coupon
                    </h2>
                    <p className="text-sm text-black">
                      Save more on your order
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-black mt-2">
                Order Total:{" "}
                <span className="font-semibold">
                  {currencySymbol}
                  {orderTotal.toLocaleString()}
                </span>
              </div>

              {/* Coin–Coupon conflict banner */}
              <AnimatePresence>
                {coinConflictOpen && pendingCoupon && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900"
                  >
                    <p className="text-sm">
                      You’ve already applied <b>{claimedCoins}</b> coins.
                      Applying <b>{pendingCoupon.name}</b> will remove your coin
                      discount.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="outline"
                        className="h-8 flex-1"
                        onClick={cancelCoinConflict}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="h-8 text-white flex-1"
                        onClick={proceedAfterRemovingCoins}
                        disabled={isRemovingCoinz || isApplyingCoupon}
                      >
                        Proceed
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Coupons list */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Available Coupons
              </h3>
              <div className="space-y-3">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : couponError ? (
                  <p className="text-sm text-red-500">
                    Failed to load coupons.
                  </p>
                ) : safeCoupons.length ? (
                  safeCoupons.map((coupon, index) => {
                    const minOrder = coupon?.conditions?.billValue || 0;
                    const { ok, reason } = isCouponEligible(coupon);
                    const eligible = ok;
                    const discount = calcDiscount(coupon);
                    const expanded = expandedId === coupon._id;

                    const avail = coupon?.conditions?.availability;
                    const when = avail?.when || "allthetime";
                    const customDays = avail?.customDays || [];
                    const startTime =
                      typeof avail?.startTime === "number"
                        ? avail.startTime
                        : 0;
                    const endTime =
                      typeof avail?.endTime === "number" ? avail.endTime : 24;

                    const validTill = coupon?.conditions?.couponEndDate
                      ? formatDate(coupon.conditions.couponEndDate)
                      : "N/A";

                    const isThisApplied = currentCouponId === coupon._id;

                    return (
                      <motion.div
                        key={coupon._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className={`relative border rounded-xl p-4 ${
                          eligible
                            ? "border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="px-3 py-1 bg-white border-2 border-dashed border-blue-400 rounded-lg">
                                <code className="text-sm font-bold text-blue-600">
                                  {coupon.name}
                                </code>
                              </div>
                              {!coupon.isActive && (
                                <span className="text-xs text-red-500">
                                  Inactive
                                </span>
                              )}
                              {coupon.visiable === false && (
                                <span className="text-xs text-orange-500">
                                  Hidden
                                </span>
                              )}
                              {isThisApplied && (
                                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                  Applied
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
                              <div className="space-y-1">
                                <p className="text-[0.7rem] text-gray-500">
                                  Min. Bill Amount
                                </p>
                                <p className="font-medium">
                                  {currencySymbol}
                                  {minOrder}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <p className="text-[0.7rem] text-gray-500">
                                  Valid Till
                                </p>
                                <p className="font-medium">{validTill}</p>
                              </div>

                              <div className="space-y-1">
                                <p className="text-[0.7rem] text-gray-500">
                                  Applicable on
                                </p>
                                <p className="font-medium capitalize">
                                  {getAvailabilityText(when, customDays).join(
                                    ", ",
                                  )}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <p className="text-[0.7rem] text-gray-500">
                                  Avail on
                                </p>
                                <p className="font-medium">
                                  {formatTime(startTime)} -{" "}
                                  {formatTime(endTime)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-base font-bold text-green-600">
                                You’ll save {currencySymbol}
                                {discount.toLocaleString()}
                              </span>
                              {minOrder > 0 && orderTotal < minOrder && (
                                <span className="text-xs text-red-500">
                                  (Min order: {currencySymbol}
                                  {minOrder.toLocaleString()})
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(expanded ? null : coupon._id)
                              }
                              className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline"
                            >
                              <Info className="w-3.5 h-3.5" />
                              Terms & Conditions
                              {expanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <AnimatePresence initial={false}>
                              {expanded && (
                                <motion.div
                                  key="tc"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 rounded-lg bg-white/70 p-3 text-xs text-gray-700 space-y-1">
                                    {normalizeTc(coupon?.conditions?.tc)
                                      .length ? (
                                      normalizeTc(coupon?.conditions?.tc).map(
                                        (line, i) => <p key={i}>• {line}</p>,
                                      )
                                    ) : (
                                      <p>No specific terms provided.</p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {!eligible && reason && (
                              <p className="text-xs text-red-500">{reason}</p>
                            )}
                          </div>

                          {/* CTA per-card */}
                          {currentCouponId === coupon._id ? (
                            <Button
                              onClick={handleRemoveCoupon}
                              disabled={isRemovingCoupon}
                              size="sm"
                              variant="outline"
                              className="gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Remove
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleApplyClick(coupon)}
                              disabled={!eligible || isApplyingCoupon}
                              size="sm"
                              className="bg-gradient-to-r text-white from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                            >
                              Apply
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No coupons available
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          // Success page (confetti is triggered by useEffect on showSuccess)
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </motion.div>
            </motion.div>

            <div className="text-center space-y-2">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              >
                Coupon Applied!
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground"
              >
                You saved
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center"
            >
              <p className="text-4xl font-bold text-green-600">
                {currencySymbol}
                {appliedDiscount.toLocaleString()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomPopUp>
  );
}
