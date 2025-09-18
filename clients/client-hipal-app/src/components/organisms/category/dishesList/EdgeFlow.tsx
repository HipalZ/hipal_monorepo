"use client";
import { type FC, memo, useEffect, useMemo, useRef } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import { InView } from "react-intersection-observer";
import { useDishesStore } from "@/components/store/useDishesStore";
// Import motion from framer-motion at the top of the file
import { motion } from "framer-motion";
import Image from "next/image";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import GridDishCard from "@/components/atoms/card/GridDishCard";

interface EdgeFlowProps {
  childCategory: CategoryType[];
  isHorizontalCard: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

const filterDishes = (visibleDishes: DishType[], isActiveDishType: string) => {
  const typeMap: Record<string, string[]> = {
    all: [],
    nonveg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
    non_veg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
    veg: ["VEG", "ALCOHOL", "NON_ALCOHOL"],
    vegan: ["VEGAN", "ALCOHOL", "NON_ALCOHOL"],
    alcohol: ["ALCOHOL"],
    nonalcohol: ["NON_ALCOHOL"],
    non_alcohol: ["NON_ALCOHOL"],
    egg: ["EGG"],
  };

  if (isActiveDishType.toLowerCase() === "all") {
    return visibleDishes;
  }

  const allowedTypes = typeMap[isActiveDishType.toLowerCase()] || [];

  return visibleDishes.filter((dish) =>
    dish.dishTypes?.some((type) => allowedTypes.includes(type)),
  );
};

const EdgeFlow = ({
  childCategory,
  isHorizontalCard = true,
  primaryColor = "#ec4899",
  secondaryColor = "#fce7f3",
}: EdgeFlowProps) => {
  const { setDishes } = useDishesStore();
  const isActiveDishType = useActiveClass((s) => s.isActiveDishType);
  const isActiveCategory = useActiveClass((s) => s.isActiveCategory);
  const setActiveCategory = useActiveClass((s) => s.setActiveCategory);
  const observerActive = useActiveClass((s) => s.observerActive);
  const isActiveChildCategory = useActiveClass((s) => s.isActiveChildCategory);
  const setActiveChildCategory = useActiveClass(
    (s) => s.setActiveChildCategory,
  );
  const setObserverActive = useActiveClass((s) => s.setObserverActive);

  const visibleCategoriesRef = useRef<{ [key: string]: number }>({});
  const updateActiveCategory = () => {
    if (!observerActive) return;

    const entries = Object.entries(visibleCategoriesRef.current);
    if (entries.length === 0) return;

    const closest = entries.reduce(
      (prev, curr) => {
        const currOffset = curr[1];
        if (currOffset < prev.offset) {
          return { id: curr[0], offset: currOffset };
        }
        return prev;
      },
      { id: "", offset: Number.POSITIVE_INFINITY },
    );
    if (closest.id && isActiveCategory !== closest.id) {
      setActiveCategory(closest.id);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (isActiveChildCategory !== "") {
        const element = document.getElementById(isActiveChildCategory);
        if (element) {
          element.style.scrollMarginTop = "300px";
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
        setTimeout(() => {
          setObserverActive(true);
        }, 3000);
        setActiveChildCategory("");
      }
      const active = observerActive ? "" : isActiveCategory;
      const element = document.getElementById(active);
      if (element) {
        element.style.scrollMarginTop = "300px";
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [
    isActiveCategory,
    isActiveChildCategory,
    observerActive,
    setActiveChildCategory,
    setObserverActive,
  ]);

  useMemo(() => {
    const allDishes = childCategory.reduce(
      (acc: DishType[], category: CategoryType) => {
        return acc.concat(
          category.dishIds.filter(
            (dish: DishType) => dish.visibility && !dish.isDeleted,
          ),
        );
      },
      [],
    );
    setDishes(allDishes);
    return allDishes;
  }, [childCategory, isActiveDishType, setDishes]);

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Left sidebar for categories - Edge layout style */}
      <div
        className="w-[20%] h-full overflow-y-auto sticky pb-[5rem] top-[2.5rem] max-h-[calc(100vh-8rem)] border-r border-gray-200 hide-scrollbar"
        id="category-sidebar"
      >
        {/* Add a container div that will ensure content fills the entire scrollable area */}
        <div className="flex flex-col min-h-full pb-20">
          {childCategory.map((category: CategoryType) => {
            const isActive = category._id === isActiveCategory;

            return (
              <button
                type="button"
                id={`sidebar-category-${category._id}`}
                key={category._id}
                className={cn(
                  "w-full mb-2 p-2 text-xs font-medium flex flex-col items-center transition-colors",
                )}
                style={{
                  color: isActive ? primaryColor : "black",
                  borderColor: isActive ? primaryColor : "transparent",
                  borderStyle: "solid",
                  borderWidth: "0 4px 0 0",
                }}
                onClick={() => {
                  setObserverActive(false);
                  setActiveCategory(category._id?.toString() || "");
                  const element = document.getElementById(
                    category._id?.toString() || "",
                  );
                  if (element) {
                    element.style.scrollMarginTop = "110px";
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                  setTimeout(() => {
                    setObserverActive(true);
                  }, 1000);
                }}
              >
                {category.coverImage ? (
                  <div
                    className="w-12 h-12 mb-1 overflow-hidden transition-colors border-2 rounded-full"
                    style={{
                      borderColor: isActive ? primaryColor : "transparent",
                    }}
                  >
                    <Image
                      src={category.coverImage}
                      alt={category.name}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center w-8 h-8 mb-1 transition-colors rounded-full"
                    style={{
                      backgroundColor: isActive ? "white" : secondaryColor,
                      color: isActive ? primaryColor : "gray",
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderColor: isActive ? primaryColor : "transparent",
                    }}
                  >
                    {category.name.charAt(0)}
                  </div>
                )}
                <motion.span
                  className="w-full text-center line-clamp-3"
                  animate={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                  transition={{ duration: 0.2 }}
                  title={category.name}
                >
                  {category.name}
                </motion.span>
              </button>
            );
          })}
          {/* Add a spacer div at the end to prevent clicking on empty space */}
          <div className="flex-grow pointer-events-none" />
        </div>
      </div>

      {/* Right content area for dishes */}
      <div className="w-[80%] overflow-y-auto bg-white pb-[5rem] hide-scrollbar scroll-pt-16">
        {childCategory.map((category: CategoryType, index) => {
          const visibleDishes = category.dishIds.filter(
            (dish: DishType) => dish.visibility,
          );
          const dishesToRender = filterDishes(visibleDishes, isActiveDishType);
          if (dishesToRender.length === 0) return null;

          return (
            <section
              key={`${category._id}${index}`}
              className={cn("w-full pb-4 overflow-hidden")}
              id={category._id?.toString()}
            >
              <InView
                rootMargin="-150px 0px 0px 0px"
                threshold={0.75}
                onChange={(inView, entry) => {
                  const categoryId = category._id?.toString();
                  if (categoryId) {
                    if (inView) {
                      visibleCategoriesRef.current[categoryId] = Math.abs(
                        entry.boundingClientRect.top - 300,
                      );
                    } else {
                      delete visibleCategoriesRef.current[categoryId];
                    }
                    updateActiveCategory();
                  }
                }}
              >
                {({ ref }) => (
                  <div
                    ref={ref}
                    className={cn(
                      "z-40 flex items-center space-x-4 justify-between h-[4rem] px-4 font-bold prose",
                    )}
                    style={{
                      backgroundColor: `${secondaryColor}50`,
                      borderBottom: `1px solid ${primaryColor}20`,
                    }}
                  >
                    <h2
                      className="w-full text-xl font-medium capitalize truncate"
                      style={{ color: primaryColor }}
                      title={category.name || "Unnamed Category"}
                    >
                      {category.name || "Unnamed Category"}
                    </h2>
                  </div>
                )}
              </InView>

              {isHorizontalCard ? (
                <div className="flex flex-col divide-y divide-gray-100">
                  {dishesToRender.map((dishData: DishType, dishIndex) => (
                    <HorizontalCard
                      key={`${dishData._id}-${dishIndex}`}
                      dishData={dishData}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                      isEdgeLayout={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2">
                  {dishesToRender.map((dishData: DishType, dishIndex) => (
                    <GridDishCard
                      key={`${dishData._id}-${dishIndex}`}
                      dishData={dishData}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                      isEdgeLayout={true}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default memo(EdgeFlow);
