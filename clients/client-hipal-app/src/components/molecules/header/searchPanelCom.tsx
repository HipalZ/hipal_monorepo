"use client";

import React, { memo, useCallback, useMemo } from "react";
import { useSearch } from "@/components/store/useSearch";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import { useActiveClass } from "@/components/store/useActiveClass";
import { motion, AnimatePresence } from "framer-motion";
import CommonBottomButton from "@/components/atoms/bottomButton";
import type { DishType } from "@hi/db-models/src/validators";
import { Search, X } from "lucide-react";

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
    searchableDish.tags?.map((tag) => {
      if (typeof tag === "string") return tag;
      return (tag as { name?: string })?.name || "";
    }) || [];

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

const MemoSearchPanelCom = ({
  allDishes,
  primaryColor,
  secondaryColor,
}: {
  allDishes: DishType[];
  primaryColor: string;
  secondaryColor: string;
}) => {
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

  return (
    <AnimatePresence>
      {isSearchActive && (
        <motion.div
          className="plus-jakarta-font min-h-[100dvh] px-4 pb-28 pt-3"
          style={{ backgroundColor: secondaryColor }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="flex items-center gap-2 rounded-[1.35rem] bg-white p-2 text-base shadow-[0_12px_34px_rgba(15,23,42,0.08)] ring-1 ring-emerald-950/10"
            variants={itemVariants}
          >
            <Search
              className="ml-2 h-5 w-5 shrink-0"
              style={{ color: primaryColor }}
            />
            <input
              type="search"
              className="plus-jakarta-font h-11 min-w-0 flex-1 bg-transparent px-1 text-[0.95rem] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Search for items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              onClick={handleBack}
              aria-label="Close search"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
          <motion.div
            className="mt-4 flex items-center justify-between px-1 text-xs font-semibold text-slate-500"
            variants={itemVariants}
          >
            <span>
              {searchText.trim()
                ? `${filteredDishes.length} match${filteredDishes.length === 1 ? "" : "es"}`
                : "Recommended items"}
            </span>
            <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-slate-500 ring-1 ring-black/5">
              {isActiveDishType === "all" ? "All" : isActiveDishType}
            </span>
          </motion.div>
          <motion.div
            className="mt-2 max-h-[calc(100dvh-12rem)] min-h-[calc(100dvh-12rem)] overscroll-contain space-y-3 overflow-y-auto pr-1"
            variants={itemVariants}
          >
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish, index) => (
                <motion.div
                  key={`${dish._id}-${index}`}
                  variants={itemVariants}
                >
                  <HorizontalCard
                    dishData={dish}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    noDescription
                  />
                </motion.div>
              ))
            ) : (
              <div className="rounded-[1.35rem] bg-white px-5 py-12 text-center shadow-[0_12px_34px_rgba(15,23,42,0.06)] ring-1 ring-emerald-950/10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <Search className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  No matching items
                </p>
                <p className="mx-auto mt-1 max-w-[15rem] text-xs leading-5 text-slate-500">
                  Try another item name or clear the current filter.
                </p>
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
                  className:
                    "bg-[#111111] text-white text-base rounded-[1.25rem]",
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
