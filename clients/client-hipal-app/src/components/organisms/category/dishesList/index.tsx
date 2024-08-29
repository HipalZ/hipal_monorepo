"use client";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import { type FC, memo, useEffect, useMemo, useRef } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import { GiKnifeFork } from "react-icons/gi";

interface IDishesProps {
  childCategory: CategoryType[];
}

const DishesList: FC<IDishesProps> = (props) => {
  const { childCategory } = props;
  const { isActiveDishType, isActiveCategory, setActiveCategory } =
    useActiveClass((state) => ({
      isActiveDishType: state.isActiveDishType,
      isActiveCategory: state.isActiveCategory,
      setActiveCategory: state.setActiveCategory,
    }));

  const subTypes = useMemo(() => {
    return childCategory.filter(
      (category) =>
        category.hierarchy === "CHILD" && category.dishIds.length > 0,
    );
  }, [childCategory]);

  const filterDishes = (dishes, dishType) => {
    return dishes.filter(
      (dish) => dish.visibility && dish.dishTypes.includes(dishType),
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

  const handleCategoryInView = (category) => {
    console.log(category._id);
    setActiveCategory(category._id?.toString());
  };

  return (
    <div>
      {subTypes?.map((category: CategoryType, index) => {
        const headingRef = useRef(null);
        useEffect(() => {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  handleCategoryInView(category);
                }
              });
            },
            {
              root: null,
              rootMargin: "-200px 0px 0px 0px",
              threshold: 0.75,
            },
          );

          if (headingRef.current) {
            observer.observe(headingRef.current);
          }

          return () => {
            if (headingRef.current) {
              observer.unobserve(headingRef.current);
            }
          };
        }, [headingRef, category]);

        return (
          <section
            className={"min-h-60 bg-base-100 w-full pb-4"}
            id={category._id?.toString()}
            key={`${category._id}${index}`}
          >
            <div
              className={cn(
                { "border-t-2 border-primary": category.dishIds.length !== 0 },
                "z-40 flex flex-row justify-between px-2 font-bold prose bg-base-200",
              )}
            >
              <h3
                className="my-4 text-xl font-medium capitalize text-primary"
                ref={headingRef}
              >
                {category?.name || ""}
              </h3>
              <h4 className="my-4 text-lg font-medium text-primary">
                {category?.dishIds?.length}
              </h4>
            </div>
            <div className="flex flex-col divide-y divide-base-300">
              {isActiveDishType.toLowerCase() === "all" ? (
                category?.dishIds?.map((dishData: DishType, dishIndex) => (
                  <HorizontalCard
                    dishData={dishData}
                    key={`${dishData?._id?.toString()}${dishIndex}`}
                  />
                ))
              ) : filterDishes(category.dishIds, isActiveDishType).length ===
                0 ? (
                <div className="flex items-center justify-center h-full mt-16 text-lg text-primary">
                  <GiKnifeFork className="mr-4 text-2xl text-primary-100" /> No
                  Dishes Available
                </div>
              ) : (
                filterDishes(category.dishIds, isActiveDishType).map(
                  (dishData: DishType, dishIndex) => (
                    <HorizontalCard
                      dishData={dishData}
                      key={`${dishData?._id?.toString()}${dishIndex}`}
                    />
                  ),
                )
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

const MemoDishesList = memo(DishesList);
export default MemoDishesList;
