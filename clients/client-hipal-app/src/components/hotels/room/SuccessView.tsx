"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import SpringConfetti from "@/assets/cart/SpringConfetti.png";
import StockPot from "@/assets/cart/StockPot.png";
import OnlineFoodOrder from "@/assets/cart/OnlineFoodOrder.png";
import ConfettiHeader from "@/components/organisms/confettiHeader";
import TransitionImages from "@/components/organisms/cart/transitionImages";

interface ILinkHotels {
  _id: string;
  name: string;
  customLink: string;
  logo: string;
}

interface SuccessViewProps {
  restaurant: ILinkHotels | null;
}

export const SuccessView = ({ restaurant }: SuccessViewProps) => {
  const [countdown, setCountdown] = useState(3);
  const images = [StockPot, OnlineFoodOrder, StockPot];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((value) => Math.max(1, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <center className="plus-jakarta-font">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
      >
        <Image src={SpringConfetti} alt="Order placed" />
      </motion.div>

      <div className="relative mt-20 aspect-square w-[230px] overflow-hidden rounded-full bg-[#00880014]">
        <TransitionImages images={images} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 max-w-md space-y-4 px-4"
      >
        <div className="text-[#525252]">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Success! Your order is placed
          </h1>

          {restaurant && (
            <p className="text-base font-medium leading-relaxed text-gray-600">
              Thank you for ordering from{" "}
              <span className="font-bold text-[#008800]">{restaurant.name}</span>
            </p>
          )}
        </div>

        <motion.div
          key={countdown}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="mx-auto inline-flex items-center rounded-full bg-[#00880012] px-4 py-2 text-sm font-bold text-[#007A35]"
        >
          Returning to menu in {countdown}
        </motion.div>
      </motion.div>

      <ConfettiHeader direction="bottom" />
    </center>
  );
};
