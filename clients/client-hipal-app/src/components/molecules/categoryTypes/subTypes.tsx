"use client";

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
import { getRandomBlurImg } from "@/components/utils/images";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import OtherOutletCard from "@/components/atoms/card/otherOutletCard";
import NoDishesCard from "@/components/atoms/empty/NoDishesCard";

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
  childCategory: CategoryType[];
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
            autoWidth: true,
          }}
          className="w-full no-scrollbar"
        >
          {filteredCategories.map((cat) => {
            const active = cat._id?.toString() === isActiveCategory;

            return (
              <SplideSlide key={cat._id}>
                <motion.button
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className="relative flex flex-col items-center px-2 py-2 mx-2"
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.coverImage ? (
                    <div className="w-12 h-12 mb-1 overflow-hidden rounded-md">
                      <Image
                        src={cat.coverImage}
                        alt={cat.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 mb-1 rounded-md"
                      style={{ backgroundColor: secondaryColor }}>
                      <span className="text-lg font-semibold">
                        {cat.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <span
                    className="w-full max-w-[6rem] text-sm font-medium leading-4 text-center line-clamp-2"
                    style={{ color: active ? primaryColor : "#000" }}
                  >
                    {cat.name}
                  </span>

                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 w-full h-1 rounded-t-md"
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

          return (
            <motion.section
              key={cat._id}
              id={cat._id?.toString()}
              className="w-full mb-6 overflow-hidden bg-white rounded-lg shadow-sm"
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
                      className="z-40 flex items-center justify-between px-4 h-[3rem] font-bold border-l-4 rounded-t-lg"
                      style={{
                        borderColor: primaryColor,
                        backgroundColor: `${secondaryColor}20`,
                      }}
                    >
                      <h2
                        className="w-full text-2xl font-semibold text-center capitalize truncate"
                        style={{ color: primaryColor }}
                      >
                        {cat.name}
                      </h2>
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
