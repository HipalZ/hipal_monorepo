"use client";

import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiFileList3Line } from "react-icons/ri";
import { BorderBeam } from "@/components/ui/BorderBeam";

// Import the BorderBeam component

const MemoTimeBadge = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  const [isMyOrders, setIsMyOrders] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsMyOrders((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full">
      <BorderBeam
        size={250}
        colorFrom="#ffaa40"
        colorTo="#9c40ff"
        duration={3}
        delay={1}
        className="rounded-md"
        borderWidth={3}
      />
      <button
        type="button"
        onClick={onClick}
        className="relative z-10 flex justify-center items-center gap-1 pl-6 w-[7rem] h-[2.65rem] text-sm scale-[0.95] bg-transparent rounded-xl text-nowrap shadow-md"
      >
        <RiFileList3Line size={24} className="absolute left-2" />
        <AnimatePresence mode="wait">
          <motion.span
            key={isMyOrders ? "myOrders" : "payBill"}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isMyOrders ? "my order" : "pay bill"}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
};

const TimeBadge = memo(MemoTimeBadge);
export default TimeBadge;
