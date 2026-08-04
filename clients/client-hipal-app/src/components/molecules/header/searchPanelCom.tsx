"use client";

import React, { memo, useCallback, useMemo } from "react";
import { useSearch } from "@/components/store/useSearch";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import { useActiveClass } from "@/components/store/useActiveClass";
import { FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import CommonBottomButton from "@/components/atoms/bottomButton";
import type { DishType } from "@hi/db-models/src/validators";

const normalizeSearchValue = (value?: string | number | null) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();

const splitSearchTokens = (value: string) =>
  normalizeSearchValue(value).split(" ").filter(Boolean);

const levenshteinDistance = (left: string, right: string) => {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const previous = Array.from({ length: right.length + 1 }, (_, i) => i);
  const current = new Array(right.length + 1);

  for (let i = 1; i <= left.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
    }
    for (let j = 0; j <= right.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[right.length];
};

const isSubsequence = (needle: string, haystack: string) => {
  let needleIndex = 0;
  for (const char of haystack) {
    if (char === needle[needleIndex]) needleIndex += 1;
    if (needleIndex === needle.length) return true;
  }
  return false;
};

const tokenMatchScore = (queryToken: string, targetToken: string) => {
  if (!queryToken || !targetToken) return 0;
  if (targetToken === queryToken) return 120;
  if (targetToken.startsWith(queryToken)) return 100;
  if (targetToken.includes(queryToken)) return 80;

  const maxDistance = queryToken.length <= 4 ? 1 : 2;
  if (Math.abs(targetToken.length - queryToken.length) <= maxDistance) {
    const distance = levenshteinDistance(queryToken, targetToken);
    if (distance <= maxDistance) return 70 - distance * 10;
  }

  if (queryToken.length >= 3 && isSubsequence(queryToken, targetToken)) {
    return 45;
  }

  return 0;
};

const getDishSearchValues = (dish: DishType) => {
  const searchableDish = dish as DishType & {
    tags?: Array<string | { name?: string }>;
    keywords?: string[];
    shortDescription?: string;
  };

  const tagNames =
    searchableDish.tags?.map((tag) =>
      typeof tag === "string" ? tag : tag?.name || "",
    ) || [];

  return [
    dish.name,
    dish.description,
    searchableDish.shortDescription,
    ...(dish.dishTypes || []),
    ...(searchableDish.keywords || []),
    ...tagNames,
  ];
};

const getDishFuzzyScore = (dish: DishType, searchText: string) => {
  const queryTokens = splitSearchTokens(searchText);
  if (queryTokens.length === 0) return 1;

  const fields = getDishSearchValues(dish).map((value) =>
    normalizeSearchValue(value),
  );
  const allText = fields.join(" ");
  const targetTokens = splitSearchTokens(allText);

  if (!allText) return 0;
  if (allText === queryTokens.join(" ")) return 1000;
  if (allText.includes(queryTokens.join(" "))) return 850;

  let matchedScore = 0;
  for (const queryToken of queryTokens) {
    const bestTokenScore = targetTokens.reduce(
      (best, targetToken) =>
        Math.max(best, tokenMatchScore(queryToken, targetToken)),
      0,
    );
    if (bestTokenScore === 0) return 0;
    matchedScore += bestTokenScore;
  }

  return matchedScore;
};

const MemoSearchPanelCom = ({ allDishes }: { allDishes: DishType[] }) => {
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

    const normalizedSearchText = normalizeSearchValue(searchText);
    if (!normalizedSearchText) return availableDishes;

    return availableDishes
      .map((dish) => ({
        dish,
        score: getDishFuzzyScore(dish, normalizedSearchText),
      }))
      .filter(({ score }) => score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          (a.dish.name || "").localeCompare(b.dish.name || ""),
      )
      .map(({ dish }) => dish);
  }, [searchText, allDishes, isActiveDishType]);

  const handleBack = useCallback(() => {
    setSearchText("");
    setIsSearchActive(false);
  }, [setIsSearchActive, setSearchText]);

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

  // useEffect(() => {
  //   if (isSearchActive) {
  //     // Store whatever hash was originally in the URL
  //     const originalHash = window.location.hash;

  //     // Set the hash to indicate the Search is open
  //     window.location.hash = "#search";

  //     const handleHashChange = () => {
  //       // If we detect the user navigated away from #search, close the Search
  //       if (window.location.hash !== "#search") {
  //         setIsSearchActive(false);
  //       }
  //     };

  //     window.addEventListener("hashchange", handleHashChange);

  //     // Cleanup: remove listener and restore old hash if still on #search
  //     return () => {
  //       window.removeEventListener("hashchange", handleHashChange);

  //       if (window.location.hash === "#search") {
  //         if (originalHash) {
  //           window.location.hash = originalHash;
  //         } else {
  //           // Remove the hash entirely
  //           history.pushState(
  //             "",
  //             document.title,
  //             window.location.pathname + window.location.search,
  //           );
  //         }
  //       }
  //     };
  //   }
  // }, [isSearchActive, setIsSearchActive]);

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
              className="w-[100%] px-4 py-2 text-base border border-gray-300 rounded-md"
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
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish, index) => (
                <motion.div
                  key={`${dish._id}-${index}`}
                  className="py-2 border-b cursor-pointer"
                  variants={itemVariants}
                >
                  <HorizontalCard dishData={dish} />
                </motion.div>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                No dishes found
              </div>
            )}
          </motion.div>
          <CommonBottomButton
            fixed={true}
            maxWidth="30rem"
            align="bottom"
            position="mid"
            buttons={
              [
                {
                  text: "Back",
                  onClick: handleBack,
                  className: "bg-[#00000080] text-white text-base",
                },
              ]
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SearchPanelCom = memo(MemoSearchPanelCom);
export default SearchPanelCom;
