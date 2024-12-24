"use client";

import React, { memo, useCallback, useEffect, useMemo } from "react";
import { useSearch } from "@/components/store/useSearch";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import { useActiveClass } from "@/components/store/useActiveClass";
import { FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MemoSearchPanelCom = ({ allDishes }) => {
  const { searchText, setSearchText, setIsSearchActive, isSearchActive } =
    useSearch();
  const { isActiveDishType } = useActiveClass();

  const filteredDishes = useMemo(() => {
    const typeMap: Record<string, string[]> = {
      all: [],
      nonveg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
      non_veg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
      veg: ["VEG", "ALCOHOL", "NON_ALCOHOL"],
      vegan: ["VEGAN", "ALCOHOL", "NON_ALCOHOL"],
      alcoholic: ["ALCOHOL"],
      nonalcoholic: ["NON_ALCOHOL"],
    };

    const allowedTypes = typeMap[isActiveDishType?.toLowerCase()] || [];

    const availableDishes = allDishes.filter(
      (dish) =>
        dish.visibility &&
        (isActiveDishType.toLowerCase() === "all" ||
          dish.dishTypes?.some((type) => allowedTypes.includes(type))),
    );

    if (!searchText) return availableDishes;

    return availableDishes.filter((dish) =>
      dish.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [searchText, allDishes, isActiveDishType]);

  const handleBack = useCallback(() => {
    setIsSearchActive(false);
  }, [setIsSearchActive]);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: 50, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    if (isSearchActive) {
      // Store whatever hash was originally in the URL
      const originalHash = window.location.hash;

      // Set the hash to indicate the Search is open
      window.location.hash = "#search";

      const handleHashChange = () => {
        // If we detect the user navigated away from #search, close the Search
        if (window.location.hash !== "#search") {
          setIsSearchActive(false);
        }
      };

      window.addEventListener("hashchange", handleHashChange);

      // Cleanup: remove listener and restore old hash if still on #search
      return () => {
        window.removeEventListener("hashchange", handleHashChange);

        if (window.location.hash === "#search") {
          if (originalHash) {
            window.location.hash = originalHash;
          } else {
            // Remove the hash entirely
            history.pushState(
              "",
              document.title,
              window.location.pathname + window.location.search,
            );
          }
        }
      };
    }
  }, [isSearchActive, setIsSearchActive]);

  return (
    <AnimatePresence>
      {isSearchActive && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="flex items-center gap-2 mb-4 ml-2 mr-4 text-base"
            variants={itemVariants}
          >
            <input
              type="search"
              className="w-[100%] px-4 py-2 text-sm border border-gray-300 rounded-md"
              placeholder="Search for items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <FaChevronDown onClick={handleBack} className="cursor-pointer" />
          </motion.div>
          <motion.div
            className="mt-4 overflow-y-auto max-h-[95dvh] min-h-[95dvh]"
            variants={itemVariants}
          >
            {filteredDishes.map((dish, index) => (
              <motion.div
                key={`${dish._id}-${index}`}
                className="py-2 border-b cursor-pointer"
                variants={itemVariants}
              >
                <HorizontalCard dishData={dish} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SearchPanelCom = memo(MemoSearchPanelCom);
export default SearchPanelCom;
