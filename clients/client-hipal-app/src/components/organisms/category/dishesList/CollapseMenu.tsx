"use client";
import { useEffect, useMemo, useState, type FC } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import { useDishesStore } from "@/components/store/useDishesStore";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import Image from "next/image";
import HorizontalTileCard from "@/components/atoms/card/horizontalTileCard";
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription";
import MemoDishPopup from "@/components/atoms/dishPopup";
import {
  isTimingDisabledCategory,
  type CategoryWithTimingState,
} from "@/components/utils/categoryAvailability";

interface CollapseMenuProps {
  parentCategories: CategoryWithTimingState[];
  childCategories: CategoryWithTimingState[];
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
  const { isActiveDishType, isActiveCategory, isSelectedDish, setSelectedDish, setActiveCategory } =
    useActiveClass();

  const activeMainCategory = useMemo(() => {
    const matchExists = parentCategories.some(
      (cat) => cat._id === isActiveCategory,
    );
    return matchExists ? isActiveCategory : parentCategories[0]?._id || null;
  }, [isActiveCategory, parentCategories]);

  const activeCategoryObj = useMemo(() => {
    return parentCategories.find((cat) => cat._id === activeMainCategory);
  }, [activeMainCategory, parentCategories]);

const [isModalOpen, setIsModalOpen] = useState(false);

const openDishDetails = (dish: DishType) => {
  setSelectedDish(dish);
  setIsModalOpen(true);
};

const closeModal = () => {
  setSelectedDish({} as DishType);
  setIsModalOpen(false);
};

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
            const isTimingDisabled = isTimingDisabledCategory(cat);
            return (
              <button
                type="button"
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={cn(
                  "flex flex-col items-center justify-center w-[4.5rem] min-w-[4.5rem] relative transition-opacity",
                  isTimingDisabled && "opacity-60",
                )}
              >
                <div
                  className={cn(
                    "rounded-full w-[5rem] h-[5rem] border-2 overflow-hidden transition-all duration-300",
                    isTimingDisabled && "grayscale",
                  )}
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

      {activeCategoryObj?.categoryInfo && (
        <div className="px-4 pb-4 bg-gray-50 transition-all duration-300">
          <div 
            className="flex items-start gap-3 rounded-xl p-3 shadow-sm bg-white border"
            style={{ 
              borderLeft: `4px solid ${primaryColor}`,
              borderColor: `${primaryColor}30`, 
              borderLeftColor: primaryColor
            }}
          >
            <div className="mt-0.5 flex-shrink-0">
               <svg 
                 className="w-5 h-5 opacity-90" 
                 style={{ color: primaryColor }} 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 stroke="currentColor"
               >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <p className="text-[13px] sm:text-sm font-medium text-gray-600 poppins whitespace-pre-wrap leading-relaxed w-full">
              {activeCategoryObj.categoryInfo}
            </p>
          </div>
        </div>
      )}

      {/* Accordions for sub-categories */}
      <div className="pb-4 px-4 bg-gray-100/30 space-y-3">
        {filteredSubCategories?.length > 0 ? (
          filteredSubCategories.map((category) => {
            const visibleDishes = category.dishIds.filter((d) => d.visibility);
            const dishes = filterDishes(visibleDishes, isActiveDishType);
            const isOpen = openCategoryId === category._id;
            const isTimingDisabled = isTimingDisabledCategory(category);

            if (dishes.length === 0) return null;

            return (
              <div
                key={category._id}
                className={cn(
                  "bg-white rounded-xl shadow-md transition-all duration-300",
                  isTimingDisabled && "opacity-80",
                )}
              >
                {/* Subcategory Tile */}
                <button
                  type="button"
                  onClick={() =>
                    setOpenCategoryId(isOpen ? null : category._id)
                  }
                  className={cn(
                    "w-full flex items-center justify-between p-2",
                    isTimingDisabled && "grayscale",
                  )}
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
                    {isTimingDisabled && (
                      <span className="rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                        Not available
                      </span>
                    )}
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
                        onReadMore={() => openDishDetails(dish)}
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
      {isModalOpen && (
        <ItemDescriptionPopup show={isModalOpen} onClose={closeModal}>
          <MemoDishPopup dishData={isSelectedDish} />
        </ItemDescriptionPopup>
)}
    </div>
  );
};

export default CollapseMenu;
