"use client";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import { type FC, memo, useEffect, useMemo, useRef } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import { InView } from "react-intersection-observer";
import SubTypes from "@/components/molecules/categoryTypes/subTypes";
import { useSearch } from "@/components/store/useSearch";
import type { IMenuLayout, TimingType } from "@/components/types/businessData";
import { useDishesStore } from "@/components/store/useDishesStore";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import OtherOutletCard from "@/components/atoms/card/otherOutletCard";
import Header from "@/components/molecules/header";
import EdgeFlow from "./EdgeFlow";
import GridDishCard from "@/components/atoms/card/GridDishCard";

interface IDishesProps {
  childCategory: CategoryType[];
  parentCategory: CategoryType[];
  timings: TimingType;
  menuLayout: IMenuLayout
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
  const { childCategory, parentCategory, timings, menuLayout } = props;
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

  const primaryColor = menuLayout?.primaryColor || "#000000";
  const secondaryColor = menuLayout?.secondaryColor || "#f5f5f5";
  const isClassicLayout = menuLayout?.categoryLayout === 2;
  const isHorizontalCard = menuLayout?.cardLayout === 2;

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
      return childCategory?.filter(hasVisibleDishes);
    }
  }, [childCategory, parentCategory]);

  const mainTypes = useMemo(
    () =>
      parentCategory?.filter((category) => category.subCategoryIds.length > 0),
    [parentCategory],
  );

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
      let active = observerActive ? "" : isActiveCategory;
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
  }, [isActiveCategory, timings]);

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
      <section className={cn("sticky z-50 text-[#000000] bg-white top-0")}>
        <Header categories={childCategory} />
      </section>
      {isClassicLayout ?
        <>
          {!isSearchActive && (
            <SubTypes
              childCategory={subTypes}
              parentCategory={mainTypes}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              isClassicLayout={isClassicLayout}
            />
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
                className={cn("w-full pb-4 bg-[#ffffff] overflow-hidden")}
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
                        {
                          "border-t-2 border-[#000000]":
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
                <div className="flex flex-col divide-y divide-gray-100">
                  {dishesToRender.length > 0 &&
                    outletInfo?.outLetType !== "OTHER" ? <>

                    {!isHorizontalCard ? (
                      <div className="grid grid-cols-2 gap-2 p-2">
                        {dishesToRender.map((dishData: DishType, dishIndex) => (
                          <GridDishCard
                            key={`${dishData._id}-${dishIndex}`}
                            dishData={dishData}
                            primaryColor={primaryColor}
                            secondaryColor={secondaryColor}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col divide-y divide-gray-100">
                        {dishesToRender.map((dishData: DishType, dishIndex) => (
                          <HorizontalCard
                            key={`${dishData._id}-${dishIndex}`}
                            dishData={dishData}
                            primaryColor={primaryColor}
                            secondaryColor={secondaryColor}
                          />
                        ))}
                      </div>
                    )}
                  </> : (
                    <section className="grid gap-4 px-4 mt-4">
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

        </> : (
          <EdgeFlow
            childCategory={subTypes}
            parentCategory={mainTypes}
            isHorizontalCard={!isHorizontalCard}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        )
      }
    </>
  );
};

export default memo(DishesList);
