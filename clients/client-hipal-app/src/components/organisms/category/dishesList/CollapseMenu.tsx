"use client";
import { useEffect, useMemo, useState, type FC } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import { useDishesStore } from "@/components/store/useDishesStore";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import Image from "next/image";
import HorizontalTileCard from "@/components/atoms/card/horizontalTileCard";

interface CollapseMenuProps {
  parentCategories: CategoryType[];
  childCategories: CategoryType[];
  primaryColor?: string;
  secondaryColor?: string;
}

const filterDishes = (visibleDishes: DishType[], isActiveDishType: string) => {
  const typeMap: Record<string, string[]> = {
    all: [],
    non_veg: ["NON_VEG"],
    veg: ["VEG"],
    vegan: ["VEGAN"],
    alcohol: ["ALCOHOL"],
    nonalcohol: ["NON_ALCOHOL"],
    egg: ["EGG"],
  };
  if (isActiveDishType.toLowerCase() === "all") return visibleDishes;
  const allowed = typeMap[isActiveDishType.toLowerCase()] || [];
  return visibleDishes.filter((dish) =>
    dish.dishTypes?.some((type) => allowed.includes(type)),
  );
};

const CollapseMenu: FC<CollapseMenuProps> = ({
  parentCategories,
  childCategories,
  primaryColor = "#ec4899",
  secondaryColor = "#fce7f3",
}) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(
    parentCategories[0]?._id || null,
  );
  const { setDishes } = useDishesStore();
  const { isActiveDishType, isActiveCategory, setActiveCategory } =
    useActiveClass();

  const activeMainCategory = useMemo(() => {
    const matchExists = parentCategories.some(
      (cat) => cat._id === isActiveCategory,
    );
    return matchExists ? isActiveCategory : parentCategories[0]?._id || null;
  }, [isActiveCategory, parentCategories]);

  useEffect(() => {
    const allDishes = childCategories.reduce((acc: DishType[], category) => {
      return acc.concat(
        category.dishIds.filter(
          (dish: DishType) => dish.visibility && !dish.isDeleted,
        ),
      );
    }, []);
    setDishes(allDishes);
  }, [childCategories, setDishes]);

  const filteredSubCategories = childCategories.filter((cat) =>
    cat?.parentCategoryIds.includes(activeMainCategory),
  );

  return (
    <div className="min-h-[calc(100vh-6rem)]">
      {/* Tabs for main categories */}
      {parentCategories?.length > 0 && (
        <div className="flex items-start gap-4 overflow-x-auto px-4 py-3 bg-gray-50">
          {parentCategories.map((cat) => {
            const isActive = cat._id === activeMainCategory;
            return (
              <button
                type="button"
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className="flex flex-col items-center justify-center w-[4.5rem] min-w-[4.5rem] relative"
              >
                <div
                  className="rounded-full w-[5rem] h-[5rem] border-2 overflow-hidden transition-all duration-300"
                  style={
                    isActive
                      ? {
                          boxShadow: `0 0 0 2px ${primaryColor}, 0 0 0 6px white`,
                        }
                      : undefined
                  }
                >
                  {cat.coverImage && cat.coverImage.length > 0 ? (
                    <Image
                      src={cat.coverImage}
                      alt={cat.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <span
                        style={{
                          color: primaryColor,
                        }}
                        className="text-lg poppins"
                      >
                        {cat.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <span
                  className="text-sm text-center mt-1 line-clamp-2 poppins"
                  style={{
                    color: primaryColor,
                    fontWeight: isActive ? "700" : "400",
                  }}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Accordions for sub-categories */}
      <div className="pb-4 px-4 bg-gray-100/30 space-y-3">
        {filteredSubCategories?.length > 0 ? (
          filteredSubCategories.map((category) => {
            const visibleDishes = category.dishIds.filter((d) => d.visibility);
            const dishes = filterDishes(visibleDishes, isActiveDishType);
            const isOpen = openCategoryId === category._id;

            if (dishes.length === 0) return null;

            return (
              <div
                key={category._id}
                className="bg-white rounded-xl shadow-md transition-all duration-300"
              >
                {/* Subcategory Tile */}
                <button
                  type="button"
                  onClick={() =>
                    setOpenCategoryId(isOpen ? null : category._id)
                  }
                  className="w-full flex items-center justify-between p-2"
                  style={{
                    color: primaryColor,
                    borderBottom: isOpen
                      ? `1px solid ${primaryColor}30`
                      : "none",
                  }}
                >
                  <div
                    className={`flex items-center transition-all duration-300 ${
                      isOpen ? "h-[2rem]" : "h-[4rem]"
                    } gap-3`}
                  >
                    {category.coverImage && (
                      <Image
                        src={category.coverImage}
                        alt={category.name}
                        width={44}
                        height={44}
                        className={`rounded-md object-cover transition-all duration-300 ${
                          isOpen ? "w-0 h-0" : "w-16 h-16"
                        } `}
                      />
                    )}
                    <span
                      className={`text-sm font-medium poppins ${
                        isOpen ? "font-semibold" : ""
                      }`}
                    >
                      {category.name}
                    </span>
                  </div>
                  <article className="flex items-center gap-2">
                    <p className="text-sm bg-gray-50 rounded-full px-2 py-1 text-primary">
                      {dishes.length}
                    </p>
                    <svg
                      className={cn(
                        "w-5 h-5 transform transition-transform",
                        isOpen && "rotate-180",
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </article>
                </button>

                {/* Dish List */}
                {isOpen && (
                  <>
                    {dishes.map((dish) => (
                      <HorizontalTileCard
                        key={dish._id}
                        dishData={dish}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                      />
                    ))}
                  </>
                )}
              </div>
            );
          })
        ) : (
          <center className="text-gray-500 text-sm poppins-regular mt-20">
            No Dishes Found
          </center>
        )}
      </div>
    </div>
  );
};

export default CollapseMenu;
