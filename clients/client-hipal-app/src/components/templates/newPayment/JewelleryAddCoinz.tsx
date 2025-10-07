import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserCoinz } from "../../hooks/useUserCoinz";
import useLoyaltyData from "../../store/useLoyaltyData";
import { usePaymentStore } from "../../store/usePaymentStore";
import { useOrderStore } from "../../store/useOrder";
import {
  useApplyJewelleryCoinz,
  useRemoveJewelleryCoinz,
} from "../../hooks/jewellery/useCoinz";
import { useRemoveJewelleryCoupon } from "../../hooks/jewellery/useJewelleryCoupon";
import { Coins, Sparkles, CheckCircle2 } from "lucide-react";

type CoinzBottomPopupProps = {
  open: boolean;
  onClose: () => void;
  maxCoins?: number;
  title?: string;
  height?: string;
};

export default function CoinzBottomPopup({
  open,
  onClose,
  maxCoins,
  title = "Add Coinz",
  height = "70dvh",
}: CoinzBottomPopupProps) {
  const [value, setValue] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [appliedCoins, setAppliedCoins] = useState(0);

  // ⚠️ New: conflict state when a coupon is already applied
  const [couponConflictOpen, setCouponConflictOpen] = useState(false);
  const [pendingCoins, setPendingCoins] = useState<number>(0);

  const loyaltySetting = useLoyaltyData((s) => s.loyaltySetting);
  useUserCoinz(loyaltySetting?.loyaltyId);
  const userCoinz = usePaymentStore((s) => s.userCoinz) ?? 0;
  const orderData = useOrderStore((s) => s.orderData);

  const { isApplyingCoinz, applyJewelleryCoinz } = useApplyJewelleryCoinz();
  const { isRemovingCoinz, removeJewelleryCoinz } = useRemoveJewelleryCoinz();
  const { removeJewelleryCoupon, isRemovingCoupon } =
    useRemoveJewelleryCoupon();

  const currentCouponId = orderData?.couponId || null;

  // 🎉 Confetti helper
  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    const rng = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: rng(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#FF69B4", "#00CED1"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: rng(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#FF69B4", "#00CED1"],
      });
    }, 250);
  }, []);

  // Prefill with already applied coins
  useEffect(() => {
    if (open) {
      const prefill = Number(orderData?.claimedCoins || 0);
      setValue(prefill > 0 ? String(prefill) : "");
      setShowSuccess(false);
    }
  }, [open, orderData?.claimedCoins]);

  // Limits & max calculations
  const { claimedPercent, rewardLimit, dynamicMax } = useMemo(() => {
    const claimed = Number(loyaltySetting?.setClaimedPercentage ?? 100);
    const limit = Number(loyaltySetting?.rewardLimit ?? 4999);
    const fromPercent = Math.floor((userCoinz * claimed) / 100);

    const effectiveMax = Math.min(
      Math.max(0, userCoinz),
      Math.max(0, limit),
      Math.max(0, fromPercent),
      Math.max(0, orderData?.total ?? Number.POSITIVE_INFINITY),
      typeof maxCoins === "number" ? maxCoins : Number.POSITIVE_INFINITY,
    );

    return {
      claimedPercent: claimed,
      rewardLimit: limit,
      dynamicMax: effectiveMax,
    };
  }, [
    loyaltySetting?.setClaimedPercentage,
    loyaltySetting?.rewardLimit,
    userCoinz,
    maxCoins,
    orderData?.total,
  ]);

  // Input handling
  const sanitize = useCallback((raw: string) => raw.replace(/\D+/g, ""), []);
  const maxLen = useMemo(
    () => Math.max(1, String(Math.max(0, dynamicMax || 0)).length || 4),
    [dynamicMax],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const onlyDigits = sanitize(e.target.value);
      const normalized = onlyDigits.replace(/^0+(\d)/, "$1");
      setValue(normalized.slice(0, maxLen));
    },
    [sanitize, maxLen],
  );

  const coins = useMemo(
    () => Math.min(Number(value || "0"), dynamicMax),
    [value, dynamicMax],
  );

  const isEmpty = value.length === 0;
  const isZero = coins <= 0;
  const isTooHigh = Number(value || 0) > dynamicMax;
  const isSameAsCurrent =
    Number(orderData?.claimedCoins || 0) > 0 &&
    Number(orderData?.claimedCoins || 0) === coins;

  const isInvalid = isEmpty || isZero || isTooHigh;

  // Core apply flow
  const applyCoinsInternal = useCallback(
    async (amount: number) => {
      const res = await applyJewelleryCoinz({
        coinsClaimed: amount,
        orderId: orderData?._id || "",
      });
      if (res?.status === 200 || res?.status === 201) {
        setAppliedCoins(amount);
        setShowSuccess(true);
        triggerConfetti();

        setTimeout(() => {
          onClose();
          setValue("");
          setShowSuccess(false);
        }, 4000);
      }
    },
    [applyJewelleryCoinz, orderData?._id, triggerConfetti, onClose],
  );

  const handleApply = useCallback(async () => {
    if (isInvalid) return;

    // 🆕 If a coupon is already applied, confirm replacing it with coins
    if (currentCouponId) {
      setPendingCoins(coins);
      setCouponConflictOpen(true);
      return;
    }

    await applyCoinsInternal(coins);
  }, [isInvalid, coins, currentCouponId, applyCoinsInternal]);

  const proceedAfterRemovingCoupon = useCallback(async () => {
    if (!pendingCoins || !orderData?._id) return;
    const res = await removeJewelleryCoupon({ orderId: orderData._id });
    if (res?.status === 200 || res?.status === 201) {
      await applyCoinsInternal(pendingCoins);
    }
    setCouponConflictOpen(false);
    setPendingCoins(0);
  }, [pendingCoins, orderData?._id, removeJewelleryCoupon, applyCoinsInternal]);

  const cancelCouponConflict = useCallback(() => {
    setCouponConflictOpen(false);
    setPendingCoins(0);
  }, []);

  const handleRemove = useCallback(async () => {
    await removeJewelleryCoinz({ orderId: orderData?._id || "" });
    onClose();
  }, [removeJewelleryCoinz, orderData?._id, onClose]);

  return (
    <BottomPopUp
      height={showSuccess ? "60dvh" : "100dvh"}
      show={open}
      onClose={onClose}
      rightTopBack
      hide
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="mb-6 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-2xl opacity-50 animate-pulse" />
              <CheckCircle2
                className="w-24 h-24 text-emerald-500 relative z-10"
                strokeWidth={2}
              />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-4"
            >
              Coins Applied Successfully!
            </motion.h2>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1,
                }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-4 rounded-2xl border-2 border-amber-200 shadow-lg"
              >
                <Coins className="w-8 h-8 text-amber-500" />
                <div className="text-left">
                  <p className="text-sm text-gray-600 font-medium">You saved</p>
                  <p className="text-4xl font-bold text-amber-600">
                    ₹{appliedCoins}
                  </p>
                </div>
                <Sparkles className="w-6 h-6 text-orange-500" />
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-gray-600 text-sm"
            >
              Your discount has been applied to the order
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex gap-2 text-amber-500"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          // 🧱 Full UI (unchanged) + new conflict confirmation banner
          <motion.div
            key="form"
            className="space-y-6 p-6 text-black"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
          >
            {/* Header (animated icon + title) */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 2,
                }}
              >
                <Coins className="w-7 h-7 text-amber-500" />
              </motion.div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {title}
              </h3>
            </div>

            {/* Summary card */}
            <motion.div
              className="space-y-2 text-sm rounded-xl p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border border-amber-200 shadow-sm"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Balance:</span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  {userCoinz} coins
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order total:</span>
                <span className="font-bold text-gray-800">
                  ₹{orderData?.total ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Max usable:</span>
                <span className="font-bold text-emerald-600">
                  {dynamicMax} coins
                </span>
              </div>
              {claimedPercent < 100 && (
                <p className="text-xs text-gray-500 pt-1">
                  Limited to {claimedPercent}% of your balance
                </p>
              )}
              {Number(orderData?.claimedCoins || 0) > 0 && (
                <motion.div
                  className="pt-2 mt-2 border-t border-amber-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-medium">
                      Currently applied:
                    </span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {orderData?.claimedCoins} coins
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* 🔔 New: coupon conflict banner */}
            <AnimatePresence>
              {couponConflictOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900"
                >
                  <p className="text-sm">
                    A coupon is already applied. Applying coins will remove that
                    coupon discount.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="outline"
                      className="h-8"
                      onClick={cancelCouponConflict}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="h-8 text-white"
                      onClick={proceedAfterRemovingCoupon}
                      disabled={isRemovingCoupon || isApplyingCoinz}
                    >
                      Proceed
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="space-y-2">
              <label
                htmlFor="coinz"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Enter coins to apply
              </label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Input
                  id="coinz"
                  value={value}
                  onChange={handleChange}
                  inputMode="numeric"
                  placeholder={`e.g., ${Math.min(dynamicMax, 250)}`}
                  maxLength={maxLen}
                  aria-invalid={isInvalid}
                  className="text-lg font-semibold h-14 border-2 focus:border-amber-400 focus:ring-amber-400"
                />
              </motion.div>
              <div className="min-h-5 text-xs">
                {isTooHigh && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-600 font-medium"
                  >
                    ⚠️ Max allowed is {dynamicMax}
                  </motion.p>
                )}
                {isZero && !isEmpty && !isTooHigh && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-600 font-medium"
                  >
                    ⚠️ Enter more than 0
                  </motion.p>
                )}
                {isEmpty && (
                  <p className="text-gray-500">Only numbers are allowed</p>
                )}
                {Number(orderData?.claimedCoins || 0) > 0 &&
                  isSameAsCurrent &&
                  !isInvalid && (
                    <p className="text-gray-500">
                      This amount is already applied
                    </p>
                  )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {Number(orderData?.claimedCoins || 0) > 0 && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="sm:w-1/2 w-full"
                >
                  <Button
                    variant="destructive"
                    className="w-full h-12 font-semibold shadow-md"
                    onClick={handleRemove}
                    disabled={isRemovingCoinz}
                  >
                    Remove {orderData?.claimedCoins} Coins
                  </Button>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: isInvalid || isApplyingCoinz ? 1 : 1.02 }}
                whileTap={{ scale: isInvalid || isApplyingCoinz ? 1 : 0.98 }}
                className="sm:w-1/2 w-full"
              >
                <Button
                  className="w-full h-12 font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleApply}
                  disabled={isInvalid || isApplyingCoinz || isSameAsCurrent}
                  title={
                    isSameAsCurrent
                      ? "This amount is already applied"
                      : undefined
                  }
                >
                  {isApplyingCoinz ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      <Coins className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    "Apply Coins"
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Footer: Cancel */}
            <div className="flex">
              <Button
                variant="outline"
                className="w-full h-11 font-medium border-2 hover:bg-gray-50 bg-transparent"
                onClick={() => {
                  setValue("");
                  onClose();
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomPopUp>
  );
}
