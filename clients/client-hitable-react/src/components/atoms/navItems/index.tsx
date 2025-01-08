"use client";

import { useLiteStore } from "@/components/store/useLiteStore";
import type { NavItemTypes } from "@/components/types/hiClientzData";
import { navItems } from "@/components/utils/helpers";
import { memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MemoNavItems = () => {
  const {
    selectedNavItem,
    setSelectedNavItem,
    onlineCount,
    offlineCount,
    cartCount,
  } = useLiteStore((s) => ({
    selectedNavItem: s.selectedNavItem,
    onlineCount: s.onlineCount,
    offlineCount: s.offlineCount,
    cartCount: s.cartCount,
    setSelectedNavItem: s.setSelectedNavItem,
  }));

  const handleNavItemClick = useCallback(
    (type: NavItemTypes) => {
      setSelectedNavItem(type);
    },
    [setSelectedNavItem],
  );

  const handleCount = useCallback(
    (type: string) => {
      if (type === "payments" && onlineCount > 0) {
        return onlineCount + offlineCount;
      }
      if (type === "cart" && cartCount > 0) {
        return cartCount;
      }
      return null;
    },
    [offlineCount, onlineCount, cartCount],
  );

  return (
    <>
      {navItems.map(({ type, icon: Icon }) => {
        return (
          <motion.button
            key={type}
            onClick={() => handleNavItemClick(type)}
            className={`
              flex w-full max-w-[24rem] items-center justify-center px-4 py-2 rounded-full
              ${
                selectedNavItem === type
                  ? "bg-purple-100 text-purple-600"
                  : "text-gray-500 hover:bg-gray-200"
              }
              relative
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Icon
              size={24}
              className={`
                ${
                  selectedNavItem === type
                    ? "text-purple-600"
                    : "text-gray-500 group-hover:text-gray-700"
                }
                transition-colors duration-300
              `}
            />
            <AnimatePresence>
              {selectedNavItem === type && (
                <motion.span
                  className="ml-2 overflow-hidden font-medium whitespace-nowrap"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {type}
                </motion.span>
              )}
            </AnimatePresence>

            {handleCount(type) !== null && (
              <motion.span
                className="absolute z-50 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full -top-2 right-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                {handleCount(type)}
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </>
  );
};

const NavItems = memo(MemoNavItems);
export default NavItems;
