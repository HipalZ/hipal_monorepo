"use client";;
import { useActiveClass } from "@/components/store/useActiveClass";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { cn } from "@hi/common";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { InView } from "react-intersection-observer";
import { motion } from "framer-motion";

// Splide
import { Splide, SplideSlide } from "@splidejs/react-splide";
import type { Splide as SplideInstance } from "@splidejs/splide";

import GridDishCard from "@/components/atoms/card/GridDishCard";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import OtherOutletCard from "@/components/atoms/card/otherOutletCard";
import NoDishesCard from "@/components/atoms/empty/NoDishesCard";
import {
  isTimingDisabledCategory,
  type CategoryWithTimingState,
} from "@/components/utils/categoryAvailability";

/* ----------------------- Dish Renderer ------------------------ */
function DishRenderer({
  dishes,
  primaryColor,
  secondaryColor,
  isHorizontalCard,
}: {
  dishes: DishType[];
  primaryColor: string;
  secondaryColor: string;
  isHorizontalCard: boolean;
}) {
  if (!isHorizontalCard) {
    return (
      <div className="grid grid-cols-2 gap-2 p-2">
        {dishes.map((dishData, dishIndex) => (
          <GridDishCard
            key={`${dishData._id}-${dishIndex}`}
            dishData={dishData}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ backgroundColor: `${secondaryColor}20` }}>
      {dishes.map((dishData, dishIndex) => (
        <HorizontalCard
          key={`${dishData._id}-${dishIndex}`}
          dishData={dishData}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      ))}
    </div>
  );
}

/* ----------------------- Filter Dishes ------------------------ */
function filterDishes(visibleDishes: DishType[], activeType: string) {
  const typeMap: Record<string, string[]> = {
    all: [],
    nonveg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
    non_veg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
    veg: ["VEG", "ALCOHOL", "NON_ALCOHOL"],
    vegan: ["VEGAN", "ALCOHOL", "NON_ALCOHOL"],
    alcohol: ["ALCOHOL"],
    nonalcohol: ["NON_ALCOHOL"],
    non_alcohol: ["NON_ALCOHOL"],
  };

  if (activeType.toLowerCase() === "all") {
    return visibleDishes;
  }

  const allowedTypes = typeMap[activeType.toLowerCase()] || [];

  return visibleDishes.filter((dish) =>
    dish.dishTypes?.some((type) => allowedTypes.includes(type)),
  );
}

/* ----------------------- Component ------------------------ */

function MemoSubTypes({
  childCategory,
  primaryColor = "#ec4899",
  secondaryColor = "#fce7f3",
  isHorizontalCard = false,
}: {
  childCategory: CategoryWithTimingState[];
  primaryColor?: string;
  secondaryColor?: string;
  isHorizontalCard?: boolean;
}) {
  const isActiveCategory = useActiveClass((s) => s.isActiveCategory);
  const isActiveDishType = useActiveClass((s) => s.isActiveDishType);
  const setActiveCategory = useActiveClass((s) => s.setActiveCategory);
  const setActiveParentCategory = useActiveClass((s) => s.setActiveParentCategory);
  const setActiveChildCategory = useActiveClass((s) => s.setActiveChildCategory);
  const setObserverActive = useActiveClass((s) => s.setObserverActive);
  const observerActive = useActiveClass((s) => s.observerActive);
  const setActiveDishType = useActiveClass((s) => s.setActiveDishType);

  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  /* ---------------------- CATEGORY FILTERING (FIX) ----------------------- */
  const filteredCategories = useMemo(() => {
    return childCategory
      .map((cat) => {
        const visible = cat.dishIds?.filter((d) => d.visibility) || [];
        const filtered = filterDishes(visible, isActiveDishType);
        return { ...cat, __filteredDishes: filtered };
      })
      .filter((cat) => cat.__filteredDishes.length > 0); // hide empty categories
  }, [childCategory, isActiveDishType]);

  const nothingFound = filteredCategories.length === 0;


  /* ---------------------- Handle Category Click ----------------------- */
  const handleCategoryClick = useCallback(
    (category: CategoryType) => {
      setObserverActive(false);

      if (category.parentCategoryIds?.length) {
        setActiveParentCategory(category.parentCategoryIds[0]?.toString());
      }

      setActiveCategory(category._id?.toString() || "");
      setActiveChildCategory(category._id?.toString() || "");

      const element = document.getElementById(category._id?.toString() || "");
      if (element) {
        element.style.scrollMarginTop = "150px";
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setTimeout(() => {
        setObserverActive(true);
      }, 1000);
    },
    [],
  );

  /* ---------------------- Active Category Scroll Logic ----------------------- */
  const visibleCategoriesRef = useRef<{ [key: string]: number }>({});

  const updateActiveCategory = useCallback(() => {
    if (!observerActive) return;

    const entries = Object.entries(visibleCategoriesRef.current);
    if (entries.length === 0) return;

    const closest = entries.reduce(
      (prev, curr) => {
        const offset = curr[1];
        if (offset < prev.offset) return { id: curr[0], offset };
        return prev;
      },
      { id: "", offset: Number.POSITIVE_INFINITY },
    );

    if (closest.id && closest.id !== isActiveCategory) {
      setActiveCategory(closest.id);
    }
  }, [observerActive, isActiveCategory]);

  /* ---------------------- Splide Sync With Active ----------------------- */
  const splideRef = useRef<SplideInstance>(null);

  useEffect(() => {
    if (isActiveCategory && splideRef.current) {
      const index = filteredCategories.findIndex(
        (item) => item._id?.toString() === isActiveCategory,
      );
      if (index !== -1) {
        splideRef.current.go(index);
      }
    }
  }, [isActiveCategory, filteredCategories]);

  /* ---------------------- RENDER ----------------------- */

  return (
    <section className="h-[calc(100dvh)] flex flex-col bg-white">

      {/* -------------------- CATEGORY BAR -------------------- */}
      <div className={cn("top-[2.75rem] sticky z-50 bg-white border-b")}>
        <Splide
          ref={splideRef}
          options={{
            type: "slide",
            pagination: false,
            drag: "free",
            snap: true,
            arrows: false,
            fixedWidth: "5rem",
            gap: "0.25rem",
          }}
          className="w-full no-scrollbar"
        >
          {filteredCategories.map((cat) => {
            const active = cat._id?.toString() === isActiveCategory;
            const isTimingDisabled = isTimingDisabledCategory(cat);

            return (
              <SplideSlide key={cat._id}>
                <motion.button
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={cn(
                    "relative flex w-full flex-col items-center py-2 transition-opacity",
                    isTimingDisabled && "opacity-60",
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.coverImage ? (
                    <div className={cn("h-11 w-11 overflow-hidden rounded-lg", isTimingDisabled && "grayscale")}>
                      <Image
                        src={cat.coverImage}
                        alt={cat.name}
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-lg",
                        isTimingDisabled && "grayscale",
                      )}
                      style={{ backgroundColor: secondaryColor }}
                    >
                      <span className="text-base font-semibold">
                        {cat.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Fixed-height label area — prevents layout shift */}
                  <span
                    className="mt-1 h-[2rem] w-full text-center text-[11px] font-medium leading-[1rem] line-clamp-2"
                    style={{ color: active ? primaryColor : isTimingDisabled ? "#6b7280" : "#555" }}
                  >
                    {cat.name}
                  </span>

                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-x-1 bottom-0 h-[3px] rounded-t-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </motion.button>
              </SplideSlide>
            );
          })}
        </Splide>
      </div>

      {/* -------------------- DISH LIST -------------------- */}
      <div className="w-full pt-4 pb-8 overflow-y-auto scroll-pt-32"
        style={{ backgroundColor: `${secondaryColor}50` }}>

       {nothingFound ? (
                 <NoDishesCard
                   subtitle="Try clearing your dish-type filter."
                   onClear={() => setActiveDishType("all")}
                 />
               ) : (filteredCategories.map((cat, index) => {
          const dishes = cat.__filteredDishes;
          const isTimingDisabled = isTimingDisabledCategory(cat);

          return (
            <motion.section
              key={cat._id}
              id={cat._id?.toString()}
              className={cn(
                "w-full mb-6 overflow-hidden bg-white rounded-lg shadow-sm transition-opacity",
                isTimingDisabled && "opacity-80",
              )}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <InView
                rootMargin="-150px 0px 0px 0px"
                threshold={0.25}
                onChange={(inView, entry) => {
                  const id = cat._id?.toString();
                  if (!id) return;

                  if (inView) {
                    visibleCategoriesRef.current[id] = Math.abs(entry.boundingClientRect.top);
                  } else {
                    delete visibleCategoriesRef.current[id];
                  }

                  updateActiveCategory();
                }}
              >
                {({ ref }) => (
                  <>
                    <div
                      ref={ref}
                      className={cn(
                        "z-40 flex items-center justify-between gap-3 px-4 h-[3rem] font-bold border-l-4 rounded-t-lg",
                        isTimingDisabled && "grayscale",
                      )}
                      style={{
                        borderColor: primaryColor,
                        backgroundColor: `${secondaryColor}20`,
                      }}
                    >
                      <h2
                        className="min-w-0 text-2xl font-semibold capitalize truncate"
                        style={{ color: primaryColor }}
                      >
                        {cat.name}
                      </h2>
                      {isTimingDisabled && (
                        <span className="shrink-0 rounded-full border border-gray-300 bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                          Not available
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      {dishes.length > 0 &&
                        (outletInfo?.outLetType !== "OTHER" ? (
                          <DishRenderer
                            dishes={dishes}
                            primaryColor={primaryColor}
                            secondaryColor={secondaryColor}
                            isHorizontalCard={isHorizontalCard}
                          />
                        ) : (
                          <section className="grid gap-4 px-4 mt-4">
                            {dishes.map((dish, i) => (
                              <OtherOutletCard key={dish._id} dishData={dish} />
                            ))}
                          </section>
                        ))}
                    </div>
                  </>
                )}
              </InView>
            </motion.section>
          );
        }))}
      </div>
    </section>
  );
}

const SubTypes = memo(MemoSubTypes);
export default SubTypes;
