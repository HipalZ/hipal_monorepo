"use client";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import { type FC, memo, useEffect, useMemo, useRef } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import { GiKnifeFork } from "react-icons/gi";
import { InView } from "react-intersection-observer";
import MainTypes from "@/components/molecules/categoryTypes/mainTypes";
import SubTypes from "@/components/molecules/categoryTypes/subTypes";
import { useSearch } from "@/components/store/useSearch";
import type { TimingType } from "@/components/types/businessData";
import EmblaCarouselPreview from "../embla/emblaCarousalPreview";
import type { EmblaOptionsType } from "embla-carousel";

interface IDishesProps {
  childCategory: CategoryType[];
  parentCategory: CategoryType[];
  timings: TimingType;
}

const DishesList: FC<IDishesProps> = (props) => {
  const { childCategory, parentCategory, timings } = props;
  const { isSearchActive } = useSearch();
  const {
    isActiveDishType,
    isActiveCategory,
    setActiveCategory,
    observerActive,
    isActiveChildCategory,
    setActiveChildCategory,
    setObserverActive,
  } = useActiveClass((state) => ({
    isActiveDishType: state.isActiveDishType,
    isActiveCategory: state.isActiveCategory,
    setActiveCategory: state.setActiveCategory,
    observerActive: state.observerActive,
    isActiveChildCategory: state.isActiveChildCategory,
    setActiveChildCategory: state.setActiveChildCategory,
    setObserverActive: state.setObserverActive,
  }));

  const subTypes = useMemo(() => {
    return childCategory.filter((category) => {
      const hasVisibleDishes =
        category.hierarchy === "CHILD" &&
        category.dishIds.length > 0 &&
        category.dishIds.some(
          (dish: DishType) => !dish.isDeleted && dish.visibility,
        );
      return hasVisibleDishes;
    });
  }, [childCategory]);

  const filterDishes = (dishes: DishType[], dishType: string): DishType[] => {
    return dishes.filter(
      (dish) =>
        dish.visibility && !dish.isDeleted && dish.dishTypes.includes(dishType),
    );
  };

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
      { id: "", offset: Infinity },
    );
    if (closest.id && isActiveCategory !== closest.id) {
      setActiveCategory(closest.id);
    }
  };

  const OPTIONS: EmblaOptionsType = { dragFree: true, loop: true };

  useEffect(() => {
    const handleHashChange = () => {
      if (isActiveChildCategory !== "") {
        const element = document.getElementById(isActiveChildCategory);
        if (element) {
          element.style.scrollMarginTop = "250px";
          element.scrollIntoView({ behavior: "smooth" });
        }
        setTimeout(() => {
          setObserverActive(true);
        }, 3000);
        setActiveChildCategory("");
      }
      const active = timings.dishIds.length > 0 ? "" : isActiveCategory;
      const element = document.getElementById(active);
      if (element) {
        element.style.scrollMarginTop = "110px";
        element.scrollIntoView({ behavior: "smooth" });
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [isActiveCategory]);

  return (
    <div>
      <section className="sticky z-50 text-primary top-[3.125rem]">
        {!isSearchActive && (
          <>
            <MainTypes parentCategory={parentCategory} />
            <SubTypes childCategory={childCategory} />
          </>
        )}
      </section>
      {timings && timings.dishIds.length > 0 && (
        <section className="relative flex items-center justify-center w-full pt-[2rem] bg-base-100">
          <section className="flex flex-col items-center justify-center w-full max-w-[30rem] pt-[3rem] overflow-hidden pb-[10.5rem] bg-base-100 relative">
            <h1 className="absolute text-4xl text-center -translate-x-1/2 text-primary top-2 bungee-inline left-1/2">
              <span className="opacity-50">
                {timings?.heading || "Specials"}
              </span>
            </h1>
            <div className="absolute top-0 w-full rounded-full bg-base-300" />
            <EmblaCarouselPreview timings={timings} options={OPTIONS} />
          </section>
        </section>
      )}
      {subTypes.map((category: CategoryType, index) => {
        return (
          <section
            key={`${category._id}${index}`}
            className="w-full pb-4 min-h-60 bg-base-100"
            id={category._id?.toString()}
          >
            <InView
              rootMargin="-120px 0px 0px 0px"
              threshold={[0, 1]}
              onChange={(inView, entry) => {
                const categoryId = category._id?.toString();
                if (categoryId) {
                  if (inView) {
                    visibleCategoriesRef.current[categoryId] = Math.abs(
                      entry.boundingClientRect.top - 120,
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
                    {
                      "border-t-2 border-primary":
                        category.dishIds.length !== 0,
                    },
                    "z-40 flex flex-row justify-between px-2 font-bold prose bg-base-200",
                  )}
                >
                  <h3 className="my-4 text-xl font-medium capitalize text-primary">
                    {category.name || ""}
                  </h3>
                  <h4 className="my-4 text-lg font-medium text-primary">
                    {category.dishIds?.length}
                  </h4>
                </div>
              )}
            </InView>
            <div className="flex flex-col divide-y divide-base-300">
              {(() => {
                const visibleDishes = category.dishIds.filter(
                  (dish: DishType) => dish.visibility && !dish.isDeleted,
                );

                if (isActiveDishType.toLowerCase() === "all") {
                  return visibleDishes.length > 0 ? (
                    visibleDishes.map((dishData: DishType, dishIndex) => (
                      <HorizontalCard
                        dishData={dishData}
                        key={`${dishData._id?.toString()}${dishIndex}`}
                      />
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full mt-16 text-lg text-primary">
                      <GiKnifeFork className="mr-4 text-2xl text-primary-100" />{" "}
                      No Dishes Available
                    </div>
                  );
                } else {
                  const filteredDishes = filterDishes(
                    visibleDishes,
                    isActiveDishType,
                  );
                  return filteredDishes.length > 0 ? (
                    filteredDishes.map((dishData: DishType, dishIndex) => (
                      <HorizontalCard
                        dishData={dishData}
                        key={`${dishData._id?.toString()}${dishIndex}`}
                      />
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full mt-16 text-lg text-primary">
                      <GiKnifeFork className="mr-4 text-2xl text-primary-100" />{" "}
                      No Dishes Available
                    </div>
                  );
                }
              })()}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default memo(DishesList);
