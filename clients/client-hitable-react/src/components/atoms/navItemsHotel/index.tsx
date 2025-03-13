import { memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { hotelNavItems } from "@/components/utils/helpersHotel";
import { useHotelStore } from "@/components/store/useHotelStore";
import type { NavItemHotelTypes } from "@/components/types/hotelData";

const MemoNavItemsHotel = () => {
  const {
    selectedNavItem,
    setSelectedNavItem,
  } = useHotelStore((s) => ({
    selectedNavItem: s.selectedNavItem,
    setSelectedNavItem: s.setSelectedNavItem,
  }));

  const handleNavItemClick = useCallback(
    (type: NavItemHotelTypes) => {
      setSelectedNavItem(type);
    },
    [setSelectedNavItem],
  );

  const navItems = hotelNavItems();

  return (
    <>
      {navItems.map(({ type, icon: Icon }) => {
        return (
          <motion.button
            key={type}
            onClick={() => handleNavItemClick(type)}
            className={`
              flex w-full max-w-[24rem] items-center justify-center px-4 py-2 rounded-full
              ${selectedNavItem === type
                ? "bg-purple-100 text-purple-600"
                : "text-black hover:bg-gray-200"
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
                ${selectedNavItem === type
                  ? "text-purple-600"
                  : "text-black group-hover:text-gray-700"
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
          </motion.button>
        );
      })}
    </>
  );
};

const NavItemsHotel = memo(MemoNavItemsHotel);
export default NavItemsHotel;
