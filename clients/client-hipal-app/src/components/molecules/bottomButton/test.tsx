"use client";

import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiFileList3Line } from "react-icons/ri";

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
    <div className="relative items-center justify-center w-full">
      <div className="time-badge__border"></div>
      <button
        type="button"
        onClick={onClick}
        className="relative z-50 flex justify-center items-center gap-1 pl-6 w-[7rem] -mb-1 h-[2.5rem] text-sm scale-[0.95] bg-white rounded-md text-nowrap"
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
