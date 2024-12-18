"use client";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import { type FC, memo, useEffect, useMemo, useRef } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import { InView } from "react-intersection-observer";
import MainTypes from "@/components/molecules/categoryTypes/mainTypes";
import SubTypes from "@/components/molecules/categoryTypes/subTypes";
import { useSearch } from "@/components/store/useSearch";
import type { TimingType } from "@/components/types/businessData";
import EmblaCarouselPreview from "../embla/emblaCarousalPreview";
import type { EmblaOptionsType } from "embla-carousel";
import { useDishesStore } from "@/components/store/useDishesStore";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import OtherOutletCard from "@/components/atoms/card/otherOutletCard";

interface IDishesProps {
  childCategory: CategoryType[];
  parentCategory: CategoryType[];
  timings: TimingType;
}

const filterDishes = (visibleDishes: DishType[], isActiveDishType: string) => {
  const typeMap: Record<string, string[]> = {
    all: [],
    nonveg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
    non_veg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
    veg: ["VEG", "ALCOHOL", "NON_ALCOHOL"],
    vegan: ["VEGAN", "ALCOHOL", "NON_ALCOHOL"],
    alcoholic: ["ALCOHOL"],
    nonalcoholic: ["NON_ALCOHOL"],
  };

  if (isActiveDishType.toLowerCase() === "all") {
    return visibleDishes;
  }

  const allowedTypes = typeMap[isActiveDishType.toLowerCase()] || [];

  return visibleDishes.filter((dish) =>
    dish.dishTypes?.some((type) => allowedTypes.includes(type)),
  );
};

const DishesList: FC<IDishesProps> = (props) => {
  const { childCategory, parentCategory, timings } = props;
  const { setDishes } = useDishesStore();
  const { isSearchActive } = useSearch();
  const {
    isActiveDishType,
    isActiveCategory,
    setActiveCategory,
    observerActive,
    isActiveChildCategory,
    setActiveChildCategory,
    setObserverActive,
  } = useActiveClass();

  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const subTypes = useMemo(() => {
    const hasVisibleDishes = (category: CategoryType): boolean => {
      return (
        category.hierarchy === "CHILD" &&
        category.dishIds &&
        category.dishIds.length > 0
      );
    };

    if (parentCategory && parentCategory.length > 0) {
      const allSubCategoryIds = parentCategory.reduce(
        (acc: string[], parentCat: CategoryType) => {
          if (parentCat.subCategoryIds && parentCat.subCategoryIds.length > 0) {
            return acc.concat(parentCat.subCategoryIds);
          } else {
            return acc;
          }
        },
        [] as string[],
      );
      const orderedSubTypes = allSubCategoryIds
        .map((subCatId: string) => {
          return childCategory.find(
            (childCat: CategoryType) => childCat._id === subCatId,
          );
        })
        .filter((cat): cat is CategoryType => Boolean(cat));

      return orderedSubTypes.filter(hasVisibleDishes);
    } else {
      return childCategory.filter(hasVisibleDishes);
    }
  }, [childCategory, parentCategory]);

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
          element.style.scrollMarginTop = "270px";
          element.scrollIntoView({ behavior: "smooth" });
        }
        setTimeout(() => {
          setObserverActive(true);
        }, 3000);
        setActiveChildCategory("");
      }
      const active =
        timings?.dishIds?.length > 0 && observerActive ? "" : isActiveCategory;
      const element = document.getElementById(active);
      if (element) {
        element.style.scrollMarginTop = "130px";
        element.scrollIntoView({ behavior: "smooth" });
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [isActiveCategory]);

  useMemo(() => {
    const allDishes = subTypes.reduce(
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
  }, [subTypes, isActiveDishType]);

  return (
    <>
      <section className="sticky z-50 text-primary top-[3rem]">
        {!isSearchActive && (
          <>
            <SubTypes childCategory={subTypes} />
          </>
        )}
      </section>
      {Object.keys(timings)?.length > 0 && timings?.dishIds?.length > 0 && (
        <section className="relative flex items-center justify-center w-full bg-base-100">
          <section className="flex flex-col items-center justify-center w-full max-w-[30rem] pt-[1.5rem] overflow-hidden pb-[2rem] md:pb-[2rem] bg-base-100 relative">
            <h1 className="relative z-10 text-[1.75rem] text-primary bungee-inline">
              <span className="opacity-80 text-primary">
                {timings?.heading || "Specials"}
              </span>
            </h1>
            <div className="absolute -top-[6rem] w-[110%] h-[15rem] rounded-full bg-base-300" />
            <EmblaCarouselPreview timings={timings} options={OPTIONS} />
          </section>
        </section>
      )}
      {subTypes.map((category: CategoryType, index) => {
        const visibleDishes = category.dishIds.filter(
          (dish: DishType) => dish.visibility,
        );
        const dishesToRender = filterDishes(visibleDishes, isActiveDishType);

        if (dishesToRender.length === 0) return null;

        return (
          <section
            key={`${category._id}${index}`}
            className="w-full pb-4 min-h-60 bg-[#ffffff]"
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
                      entry.boundingClientRect.top - 100,
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
                        category.dishIds?.length !== 0,
                    },
                    "z-40 flex items-center space-x-4 justify-between h-[4rem] px-2 font-bold prose bg-[#cacaca50]",
                  )}
                >
                  <center
                    className="!text-2xl w-full truncate font-medium capitalize space-grotesk-700 text-black"
                    title={category.name || "Unnamed Category"}
                  >
                    {category.name || "Unnamed Category"}
                  </center>
                </div>
              )}
            </InView>
            <div className="flex flex-col divide-y divide-base-300">
              {dishesToRender.length > 0 &&
              outletInfo?.outLetType !== "OTHER" ? (
                dishesToRender.map((dishData: DishType, dishIndex) => (
                  <HorizontalCard
                    dishData={dishData}
                    key={`${dishData._id}-${dishIndex}`}
                  />
                ))
              ) : (
                <section className="grid grid-cols-2 gap-4 px-4 mt-4">
                  {dishesToRender.map((dishData: DishType, dishIndex) => (
                    <OtherOutletCard
                      dishData={dishData}
                      key={`${dishData._id}-${dishIndex}`}
                    />
                  ))}
                </section>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
};

export default memo(DishesList);
