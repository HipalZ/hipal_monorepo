"use client";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import { memo, useEffect, useMemo } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";

interface IDishesProps {
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
}

const DishesList: React.FC<IDishesProps> = (props) => {
  const { childCategory, parentCategory } = props;
  const {
    isActiveDishType,
    setActiveCategory,
    setActiveParentCategory,
    isActiveCategory,
    isActiveParentCategory,
  } = useActiveClass((state) => ({
    setActiveCategory: state.setActiveCategory,
    setActiveParentCategory: state.setActiveParentCategory,
    isActiveDishType: state.isActiveDishType,
    isActiveCategory: state.isActiveCategory,
    isActiveParentCategory: state.isActiveParentCategory,
  }));

  console.log("isActiveCategory", isActiveDishType);

  const subTypes = useMemo(
    () =>
      childCategory.filter(
        (category) =>
          category.hierarchy === "CHILD" &&
          category.parentCategoryIds.includes(isActiveParentCategory) &&
          category.dishIds.length > 0,
      ),
    [childCategory, isActiveParentCategory],
  );

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
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
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
              "z-40 flex flex-row justify-between px-6 pb-2 font-bold prose bg-base-200",
            )}
          >
            <h3 className="my-4 text-xl font-medium capitalize text-primary">
              {category?.name || ""}
            </h3>
            <h4 className="my-4 text-lg font-medium text-primary">
              {category?.dishIds?.length}
            </h4>
          </div>
          <div className="flex flex-col divide-y divide-base-base-300">
            {category?.dishIds
              ?.filter((dishData: DishType) => 
                dishData.dishTypes.includes(isActiveDishType.toUpperCase())
              )
              ?.map(
                (dishData: DishType, dishIndex) =>
                  dishData?.visibility && (
                    <div key={`${dishData?._id?.toString()}${dishIndex}`}>
                      <HorizontalCard dishData={dishData} />
                    </div>
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
