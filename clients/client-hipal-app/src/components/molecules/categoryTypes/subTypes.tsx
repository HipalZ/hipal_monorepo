"use client";

import { useActiveClass } from "@/components/store/useActiveClass";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { cn } from "@hi/common";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef } from "react";
import { InView } from "react-intersection-observer";
import { motion } from "framer-motion";

// Splide
import { Splide, SplideSlide } from "@splidejs/react-splide";
import type { Splide as SplideInstance } from "@splidejs/splide";

import GridDishCard from "@/components/atoms/card/GridDishCard";
import { getRandomBlurImg } from "@/components/utils/images";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import OtherOutletCard from "@/components/atoms/card/otherOutletCard";

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
    <div
      className="flex flex-col"
      style={{ backgroundColor: `${secondaryColor}20` }}
    >
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

interface ISubTypes {
  childCategory: CategoryType[];
  primaryColor?: string;
  secondaryColor?: string;
  isHorizontalCard?: boolean; // toggles between grid or horizontal layout for dishes
}

function MemoSubTypes({
  childCategory,
  primaryColor = "#ec4899",
  secondaryColor = "#fce7f3",
  isHorizontalCard = false,
}: ISubTypes) {
  const {
    isActiveCategory,
    isActiveDishType,
    setActiveCategory,
    setActiveParentCategory,
    setActiveChildCategory,
    setObserverActive,
    observerActive,
  } = useActiveClass();

  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  /**
   * Clicking on a category in Splide should scroll us to that category’s section.
   */
  const handleCategoryClick = useCallback(
    (category: CategoryType) => {
      setObserverActive(false);

      if (category.parentCategoryIds?.length) {
        setActiveParentCategory(category.parentCategoryIds[0]?.toString());
      }

      setActiveCategory(category._id?.toString() || "");
      setActiveChildCategory(category._id?.toString() || "");

      // Smooth scroll to the corresponding section
      const element = document.getElementById(category._id?.toString() || "");
      if (element) {
        // Adjust for top padding so the heading is visible
        element.style.scrollMarginTop = "150px";
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Re-enable the observer after a short delay
      setTimeout(() => {
        setObserverActive(true);
      }, 1000);
    },
    [
      setActiveCategory,
      setActiveParentCategory,
      setActiveChildCategory,
      setObserverActive,
    ],
  );

  /**
   * Keeps track of which sections are visible and picks the one
   * closest to the top to define the active category.
   */
  const visibleCategoriesRef = useRef<{ [key: string]: number }>({});

  const updateActiveCategory = useCallback(() => {
    if (!observerActive) return;
    const entries = Object.entries(visibleCategoriesRef.current);
    if (entries.length === 0) return;

    const closest = entries.reduce(
      (prev, curr) => {
        const offset = curr[1];
        if (offset < prev.offset) {
          return { id: curr[0], offset };
        }
        return prev;
      },
      { id: "", offset: Number.POSITIVE_INFINITY },
    );

    if (closest.id && closest.id !== isActiveCategory) {
      setActiveCategory(closest.id);
    }
  }, [observerActive, isActiveCategory, setActiveCategory]);

  /**
   * If you want Splide to automatically jump to the “active category”
   * (e.g., when scrolling), you can do so in this optional effect:
   */
  const splideRef = useRef<SplideInstance>(null);

  useEffect(() => {
    if (isActiveCategory && splideRef.current) {
      // find the category index
      const slideIndex = childCategory.findIndex(
        (item) => item._id?.toString() === isActiveCategory,
      );
      if (slideIndex !== -1) {
        splideRef.current.go(slideIndex);
      }
    }
  }, [isActiveCategory, childCategory]);

  return (
    <section className="h-[calc(100dvh)] flex flex-col bg-white">
      {/* 1) Splide top bar for categories */}
      <div className="sticky top-[3rem] z-50 bg-white border-b">
        <Splide
          ref={splideRef}
          options={{
            type: "slide",
            pagination: false,
            drag: "free",
            snap: true,
            arrows: false,
            autoWidth: true,
            // Additional Splide config as needed
          }}
          className="w-full no-scrollbar"
        >
          {childCategory.map((cat: CategoryType, index: number) => {
            const active = cat._id?.toString() === isActiveCategory;
            return (
              <SplideSlide key={cat._id}>
                <motion.button
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={cn(
                    "relative flex flex-col items-center px-2 py-2 mx-2",
                    active ? "" : "hover:bg-gray-50",
                  )}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {/* Category cover image or fallback initial */}
                  {cat.coverImage ? (
                    <div className="w-12 h-12 mb-1 overflow-hidden rounded-md">
                      <Image
                        src={cat.coverImage || ""}
                        alt={cat.name}
                        width={48}
                        height={48}
                        quality={95}
                        blurDataURL={getRandomBlurImg(48, 48)}
                        className="object-cover w-full h-full rounded-md"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-center w-12 h-12 mb-1 rounded-md"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      <span className="text-lg font-semibold text-gray-800">
                        {cat.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span
                    className="w-full max-w-[6rem] text-sm font-medium poppins-regular  leading-4 text-center line-clamp-2 h-[2rem]"
                    style={{ color: active ? primaryColor : "#000000" }}
                  >
                    {cat.name}
                  </span>

                  {/* Active category indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeCategoryIndicator"
                      className="absolute bottom-0 w-full h-1 rounded-t-md"
                      style={{ backgroundColor: primaryColor }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              </SplideSlide>
            );
          })}
        </Splide>
      </div>

      {/* 2) Main content with vertical sections */}
      <div
        className="w-full pt-4 pb-8 overflow-y-auto scroll-pt-32"
        style={{ backgroundColor: `${secondaryColor}50` }}
      >
        {childCategory.map((cat: CategoryType, index) => {
          const visibleDishes =
            cat.dishIds?.filter((dish: DishType) => dish.visibility) || [];
          const dishesToRender = filterDishes(visibleDishes, isActiveDishType);
          if (dishesToRender.length === 0) return null;

          return (
            <motion.section
              key={`${cat._id}-${index}`}
              className="w-full mb-6 overflow-hidden bg-white rounded-lg shadow-sm"
              id={cat._id?.toString()}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <InView
                rootMargin="-150px 0px 0px 0px"
                threshold={0.25}
                onChange={(inView, entry) => {
                  const categoryId = cat._id?.toString();
                  if (!categoryId) return;

                  // If inView, store distance from top
                  if (inView) {
                    const offset = Math.abs(entry.boundingClientRect.top);
                    visibleCategoriesRef.current[categoryId] = offset;
                  } else {
                    delete visibleCategoriesRef.current[categoryId];
                  }
                  updateActiveCategory();
                }}
              >
                {({ ref }) => (
                  <>
                    {/* Category heading */}
                    <div
                      ref={ref}
                      className="z-40 flex items-center justify-between px-4 h-[3rem] font-bold border-l-4 rounded-t-lg"
                      style={{
                        borderColor: primaryColor,
                        backgroundColor: `${secondaryColor}20`,
                      }}
                    >
                      <h2
                        className="w-full text-2xl font-semibold text-center capitalize truncate poppins-regular "
                        style={{ color: primaryColor }}
                        title={cat.name || "Unnamed Category"}
                      >
                        {cat.name || "Unnamed Category"}
                      </h2>
                    </div>

                    {/* Render dishes */}
                    <div className="flex flex-col">
                      {dishesToRender.length > 0 &&
                        (outletInfo?.outLetType !== "OTHER" ? (
                          <DishRenderer
                            dishes={dishesToRender}
                            primaryColor={primaryColor}
                            secondaryColor={secondaryColor}
                            isHorizontalCard={isHorizontalCard}
                          />
                        ) : (
                          <section className="grid gap-4 px-4 mt-4">
                            {dishesToRender.map(
                              (dishData: DishType, dishIndex: number) => (
                                <OtherOutletCard
                                  key={`${dishData._id}-${dishIndex}`}
                                  dishData={dishData}
                                />
                              ),
                            )}
                          </section>
                        ))}
                    </div>
                  </>
                )}
              </InView>
            </motion.section>
          );
        })}
      </div>
    </section>
  );
}

const SubTypes = memo(MemoSubTypes);
export default SubTypes;
