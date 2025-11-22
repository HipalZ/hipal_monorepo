"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import { InView } from "react-intersection-observer";
import { useDishesStore } from "@/components/store/useDishesStore";
import { motion } from "framer-motion";
import Image from "next/image";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import GridDishCard from "@/components/atoms/card/GridDishCard";
import NoDishesCard from "@/components/atoms/empty/NoDishesCard";

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

  const allowed = typeMap[isActiveDishType.toLowerCase()] || [];
  return visibleDishes.filter((dish) =>
    dish.dishTypes?.some((type) => allowed.includes(type)),
  );
};

const EdgeFlow = ({
  childCategory,
  isHorizontalCard = true,
  primaryColor = "#ec4899",
  secondaryColor = "#fce7f3",
}: {
  childCategory: CategoryType[];
  isHorizontalCard?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}) => {
  const { setDishes } = useDishesStore();

  const isActiveDishType = useActiveClass((s) => s.isActiveDishType);
  const setActiveDishType = useActiveClass((s) => s.setActiveDishType);

  const isActiveCategory = useActiveClass((s) => s.isActiveCategory);
  const setActiveCategory = useActiveClass((s) => s.setActiveCategory);

  const observerActive = useActiveClass((s) => s.observerActive);
  const setObserverActive = useActiveClass((s) => s.setObserverActive);

  const isActiveChildCategory = useActiveClass((s) => s.isActiveChildCategory);
  const setActiveChildCategory = useActiveClass((s) => s.setActiveChildCategory);

  const visibleCategoriesRef = useRef<{ [key: string]: number }>({});

  const filteredCategories = useMemo(() => {
    return childCategory
      .map((cat) => {
        const visible = cat.dishIds.filter(
          (d) => d.visibility && !d.isDeleted
        );
        const filtered = filterDishes(visible, isActiveDishType);
        return { ...cat, __filteredDishes: filtered };
      })
      .filter((cat) => cat.__filteredDishes.length > 0);
  }, [childCategory, isActiveDishType]);


  useEffect(() => {
    const all = filteredCategories.flatMap((c) => c.__filteredDishes);
    setDishes(all);
  }, [filteredCategories]);


  const nothingFound = filteredCategories.length === 0;

  const updateActiveCategory = () => {
    if (!observerActive) return;
    const entries = Object.entries(visibleCategoriesRef.current);
    if (!entries.length) return;

    const closest = entries.reduce(
      (prev, curr) => {
        if (curr[1] < prev.offset) return { id: curr[0], offset: curr[1] };
        return prev;
      },
      { id: "", offset: Infinity }
    );

    if (closest.id && closest.id !== isActiveCategory) {
      setActiveCategory(closest.id);
    }
  };

  useEffect(() => {
    const handleHash = () => {
      if (isActiveChildCategory !== "") {
        const element = document.getElementById(isActiveChildCategory);
        if (element) {
          element.style.scrollMarginTop = "300px";
          element.scrollIntoView({ behavior: "smooth" });
        }
        setTimeout(() => setObserverActive(true), 3000);
        setActiveChildCategory("");
      }

      const el = document.getElementById(
        observerActive ? "" : isActiveCategory
      );
      if (el) {
        el.style.scrollMarginTop = "300px";
        el.scrollIntoView({ behavior: "smooth" });
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [isActiveCategory, isActiveChildCategory]);


  return (
    <div className="flex h-[calc(100vh-5rem)]">

      <div
        className="w-[20%] h-full overflow-y-auto sticky pb-[5rem] top-[2.5rem] max-h-[calc(100vh-8rem)] border-r border-gray-200 hide-scrollbar"
      >
        <div className="flex flex-col min-h-full pb-20">
          {filteredCategories.map((category) => {
            const active = category._id === isActiveCategory;

            return (
              <button
                key={category._id}
                className="w-full mb-2 p-2 text-xs font-medium flex flex-col items-center"
                style={{
                  color: active ? primaryColor : "black",
                  borderRight: `4px solid ${active ? primaryColor : "transparent"}`,
                }}
                onClick={() => {
                  setObserverActive(false);
                  setActiveCategory(category._id);
                  const element = document.getElementById(category._id);
                  if (element) {
                    element.style.scrollMarginTop = "110px";
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                  setTimeout(() => setObserverActive(true), 800);
                }}
              >
                {category.coverImage ? (
                  <div
                    className="w-12 h-12 mb-1 rounded-full overflow-hidden border-2"
                    style={{ borderColor: active ? primaryColor : "transparent" }}
                  >
                    <Image
                      src={category.coverImage}
                      alt={category.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 mb-1 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: secondaryColor,
                      color: active ? primaryColor : "gray",
                      borderColor: active ? primaryColor : "transparent",
                      borderWidth: "2px",
                      borderStyle: "solid",
                    }}
                  >
                    {category.name.charAt(0)}
                  </div>
                )}

                <motion.span
                  className="w-full text-center line-clamp-3"
                  animate={{ fontWeight: active ? 600 : 400 }}
                >
                  {category.name}
                </motion.span>
              </button>
            );
          })}
          <div className="flex-grow pointer-events-none" />
        </div>
      </div>

      {/* ---------------- RIGHT DISH PANEL ---------------- */}

      <div className="w-[80%] overflow-y-auto bg-white pb-[5rem] hide-scrollbar scroll-pt-16">

        {nothingFound ? (
          <NoDishesCard
            subtitle="Try clearing your dish-type filter."
            onClear={() => setActiveDishType("all")}
          />
        ) : (
          filteredCategories.map((category, index) => {
            const dishes = category.__filteredDishes;

            return (
              <section
                key={category._id}
                id={category._id}
                className="w-full pb-4"
              >
                <InView
                  rootMargin="-150px 0px 0px 0px"
                  threshold={0.75}
                  onChange={(inView, entry) => {
                    const id = category._id;
                    if (!id) return;

                    if (inView) {
                      visibleCategoriesRef.current[id] = Math.abs(
                        entry.boundingClientRect.top - 300
                      );
                    } else {
                      delete visibleCategoriesRef.current[id];
                    }
                    updateActiveCategory();
                  }}
                >
                  {({ ref }) => (
                    <div
                      ref={ref}
                      className="flex items-center px-4 h-[4rem] border-b"
                      style={{
                        backgroundColor: `${secondaryColor}50`,
                        borderColor: `${primaryColor}20`,
                      }}
                    >
                      <h2
                        className="text-xl font-medium"
                        style={{ color: primaryColor }}
                      >
                        {category.name}
                      </h2>
                    </div>
                  )}
                </InView>

                {isHorizontalCard ? (
                  <div className="flex flex-col divide-y divide-gray-200">
                    {dishes.map((dish) => (
                      <HorizontalCard
                        key={dish._id}
                        dishData={dish}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                        isEdgeLayout
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {dishes.map((dish) => (
                      <GridDishCard
                        key={dish._id}
                        dishData={dish}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                        isEdgeLayout
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default memo(EdgeFlow);
