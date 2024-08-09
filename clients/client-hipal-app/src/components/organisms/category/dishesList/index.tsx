"use client";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import { type FC, memo, useEffect, useMemo } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";

interface IDishesProps {
  childCategory: CategoryType[];
}

const DishesList: FC<IDishesProps> = (props) => {
  const { childCategory } = props;
  const {
    isActiveDishType,
    isActiveCategory,
  } = useActiveClass((state) => ({
    isActiveDishType: state.isActiveDishType,
    isActiveCategory: state.isActiveCategory,
    isActiveParentCategory: state.isActiveParentCategory,
  }));


  const subTypes = useMemo(() => {
    return childCategory.filter(
      (category) =>
        category.hierarchy === "CHILD" &&
        category.dishIds.length > 0,
    );
  }, [childCategory]);

  // Filter dishes within categories based on the active dish type
  const filterDishes = (dishes, dishType) => {
    return dishes.filter(
      (dish) =>
        dish.visibility && dish.dishTypes.includes(dishType),
    );
  };

  useEffect(() => {
    const handleHashChange = () => {
      const element = document.getElementById(isActiveCategory);
      if (element) {
        element.style.scrollMarginTop = "200px";
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [isActiveCategory]);

  return (
    <div>
      {subTypes?.map((category: CategoryType, index) => (
        <section
          className={"min-h-60 bg-base-100 w-full pb-4"}
          id={category._id?.toString()}
          key={`${category._id}${index}`}
        >
          <div
            className={cn(
              { "border-t-2 border-primary": category.dishIds.length !== 0 },
              "z-40 flex flex-row justify-between px-4 font-bold prose bg-base-200",
            )}
          >
            <h3 className="my-4 text-xl font-medium capitalize text-primary">
              {category?.name || ""}
            </h3>
            <h4 className="my-4 text-lg font-medium text-primary">
              {category?.dishIds?.length}
            </h4>
          </div>
          <div className="flex flex-col divide-y divide-base-300">
            {isActiveDishType.toLowerCase() === "all"
              ? category?.dishIds?.map((dishData: DishType, dishIndex) => (
                  <HorizontalCard
                    dishData={dishData}
                    key={`${dishData?._id?.toString()}${dishIndex}`}
                  />
                ))
              : filterDishes(category.dishIds, isActiveDishType).map(
                  (dishData: DishType, dishIndex) => (
                    <HorizontalCard
                      dishData={dishData}
                      key={`${dishData?._id?.toString()}${dishIndex}`}
                    />
                  ),
                )}
          </div>
        </section>
      ))}
    </div>
  );
};

const MemoDishesList = memo(DishesList);
export default MemoDishesList;
