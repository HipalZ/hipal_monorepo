"use client";
import { useActiveClass } from "@/components/store/useActiveClass";
import { cn } from "@hi/common";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { memo, useCallback, useMemo, useState } from "react";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useCartStore } from "@/components/store/useCartStore";
import Bell from "@/assets/cart/bell.png";
import Image from "next/image";
import { useSearch } from "@/components/store/useSearch";
import { motion } from "framer-motion";
import BottomPopUp from "@/components/atoms/bottomPopUp";

/**
 * Generate a pastel color based on a string
 */
const generatePastelColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 80%)`;
};

interface IMainTypes {
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Filter dishes by type (e.g., "veg", "nonveg", "all", etc.).
 */
const filterDishesByType = (
  category: CategoryType,
  activeDishType: string,
): boolean => {
  return (
    category.hierarchy === "CHILD" &&
    category.dishIds &&
    category.dishIds.length > 0 &&
    category.dishIds.some((dish: DishType) => {
      const typeMap: Record<string, string[]> = {
        all: [], // Show all dishes
        nonveg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
        non_veg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
        veg: ["VEG", "ALCOHOL", "NON_ALCOHOL"],
        vegan: ["VEGAN", "ALCOHOL", "NON_ALCOHOL"],
        alcoholic: ["ALCOHOL"],
        nonalcoholic: ["NON_ALCOHOL"],
      };

      const allowedTypes = typeMap[activeDishType.toLowerCase()] || [];

      return (
        !dish.isDeleted &&
        dish.visibility &&
        (activeDishType.toLowerCase() === "all" ||
          dish.dishTypes?.some((type) => allowedTypes.includes(type)))
      );
    })
  );
};

/**
 * Group subcategories by parent category
 */
const groupSubcategoriesByParent = (
  parentCategories: CategoryType[],
  childCategories: CategoryType[],
  activeDishType: string,
) => {
  const result: Record<
    string,
    { parent: CategoryType; subcategories: CategoryType[] }
  > = {};

  parentCategories.forEach((parent) => {
    if (parent.visibility && parent.subCategoryIds?.length > 0) {
      // Filter child categories that match this parent and pass filterDishesByType
      const subcats = childCategories.filter(
        (child) =>
          child.parentCategoryIds?.includes(parent._id || "") &&
          filterDishesByType(child, activeDishType),
      );

      if (subcats.length > 0) {
        result[parent._id || ""] = {
          parent,
          subcategories: subcats,
        };
      }
    }
  });

  return result;
};

const MemoMainTypes = (props: IMainTypes) => {
  const {
    parentCategory,
    childCategory,
    primaryColor = "#000000",
    secondaryColor = "#f5f5f5",
  } = props;
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cart } = useCartStore();
  const menuName = "Menu";

  const {
    setActiveParentCategory,
    setActiveCategory,
    setObserverActive,
    isActiveDishType,
    setActiveChildCategory,
  } = useActiveClass();

  const { isSearchActive } = useSearch();

  /**
   * Group subcategories by their parent category
   */
  const categoriesByParent = useMemo(() => {
    return groupSubcategoriesByParent(
      parentCategory,
      childCategory,
      isActiveDishType,
    );
  }, [parentCategory, childCategory, isActiveDishType]);

  /**
   * For menus without parent categories
   */
  const standaloneCategories = useMemo(() => {
    // If no parent categories exist, show children that match the filter
    if (parentCategory.length === 0) {
      return childCategory.filter((cat) =>
        filterDishesByType(cat, isActiveDishType),
      );
    }
    return [];
  }, [childCategory, parentCategory, isActiveDishType]);

  /**
   * Handle category selection
   */
  const setActiveCategories = useCallback(
    (category: CategoryType) => {
      // First, disable the observer to prevent automatic category selection
      setObserverActive(false);

      // Set parent category if available
      if (category.parentCategoryIds?.length > 0) {
        setActiveParentCategory(category.parentCategoryIds[0] || "");
      }

      // Set active category and child category
      setActiveCategory(category._id?.toString() || "");
      setActiveChildCategory(category._id?.toString() || "");

      // Close the modal first
      setIsModalOpen(false);

      // Use setTimeout to ensure the modal is closed before scrolling
      setTimeout(() => {
        const element = document.getElementById(category._id?.toString() || "");
        if (element) {
          // Adjust scroll margin to ensure the category header is visible
          element.style.scrollMarginTop = "150px";

          // Scroll to the element with smooth behavior
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Re-enable the observer after scrolling is complete
          setTimeout(() => {
            setObserverActive(true);
          }, 1000);
        }
      }, 100);
    },
    [
      setActiveCategory,
      setActiveParentCategory,
      setActiveChildCategory,
      setObserverActive,
    ],
  );

  // If user is searching OR outlet is not a restaurant/cafe/food type, hide the menu button.
  if (isSearchActive || outletInfo?.outLetType === "OTHER") return null;

  return (
    <>
      {/* Floating button that opens the modal */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className={cn(
          "fixed lg:sticky flex items-center rounded-r-xl justify-between px-4 py-3 z-50 left-0",
          cart.length > 0 ? "bottom-[8.5rem]" : "bottom-[5.25rem]",
        )}
        style={{
          backgroundColor: primaryColor,
          color: secondaryColor,
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Image
          src={Bell || "/placeholder.svg"}
          alt="bell"
          width={24}
          height={24}
          className="mr-2"
        />
        {menuName}
      </button>

      {/* Categories Modal */}
      <BottomPopUp
        show={isModalOpen}
        height="80dvh"
        onClose={() => setIsModalOpen(false)}
      >
        <div
          style={{
            background: `linear-gradient(180deg, ${secondaryColor} 0%, ${secondaryColor} 100%)`,
          }}
          className="max-w-[30rem] w-full text-black pb-[10rem] hide-scrollbar rounded-xl"
        >
          {Object.keys(categoriesByParent).length > 0 && (
            <h3
              style={{
                color: primaryColor,
              }}
              className="w-full p-4 text-2xl font-medium text-center poppins-regular "
            >
              Categories
            </h3>
          )}
          {Object.values(categoriesByParent).map(
            ({ parent, subcategories }) => (
              <div key={parent._id} className="mb-4">
                <div
                  className="relative flex items-center justify-center py-2"
                  style={{ color: primaryColor }}
                >
                  {/* The line behind icon + text */}
                  <div
                    className="absolute left-0 right-0 top-1/2 h-[1px] -translate-y-1/2 z-0"
                    style={{ backgroundColor: primaryColor }}
                  />

                  {/* Icon or fallback initial (above line) */}
                  {parent?.coverImage ? (
                    <div className="relative z-10 w-5 h-5 mr-2 overflow-hidden rounded-full">
                      <Image
                        src={parent?.coverImage}
                        alt={parent.name}
                        className="object-cover w-full h-full"
                        width={20}
                        height={20}
                      />
                    </div>
                  ) : (
                    <div
                      className="relative z-10 flex items-center justify-center w-5 h-5 pl-6 pr-2 rounded-full"
                      style={{
                        color: primaryColor,
                        backgroundColor: secondaryColor,
                      }}
                    >
                      <span className="text-xs">{parent.name.charAt(0)}</span>
                    </div>
                  )}

                  {/* Text (also above line). No background so line shows behind. */}
                  <h3
                    style={{
                      backgroundColor: secondaryColor,
                    }}
                    className="relative z-10 pl-2 pr-6 text-xl font-medium capitalize poppins-regular "
                  >
                    {parent.name}
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-3 px-4 py-2">
                  {subcategories.map((category) => (
                    <motion.button
                      key={category._id}
                      className="flex flex-col items-center text-center"
                      onClick={() => setActiveCategories(category)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="w-16 h-16 mb-1 overflow-hidden bg-gray-100 rounded-full shadow-sm">
                        {category.coverImage ? (
                          <Image
                            src={category.coverImage || "/placeholder.svg"}
                            alt={category.name}
                            className="object-cover w-full h-full"
                            width={64}
                            height={64}
                          />
                        ) : (
                          <div
                            className="flex items-center justify-center w-full h-full capitalize"
                            style={{
                              backgroundColor: generatePastelColor(
                                category.name,
                              ),
                            }}
                          >
                            <span className="text-lg font-medium">
                              {category.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          color: primaryColor,
                        }}
                        className="max-w-full text-base font-medium capitalize poppins-regular line-clamp-3"
                      >
                        {category.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ),
          )}
          {standaloneCategories.length > 0 && (
            <div className="min-h-screen mb-4">
              <div
                className="flex px-4 py-2 items-center gap-2"
                style={{ color: primaryColor }}
              >
                <span className="w-full p-4 text-2xl font-medium text-center poppins-regular">
                  Categories
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 px-4 py-2">
                {standaloneCategories.map((category) => (
                  <motion.button
                    key={category._id}
                    className="flex flex-col items-center text-center"
                    onClick={() => setActiveCategories(category)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-16 h-16 mb-1 overflow-hidden bg-gray-100 rounded-full shadow-sm">
                      {category.coverImage ? (
                        <Image
                          src={category?.coverImage}
                          alt={category.name}
                          className="object-cover w-full h-full"
                          width={64}
                          height={64}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-white">
                          <span
                            style={{
                              color: primaryColor,
                            }}
                            className="text-lg font-medium"
                          >
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        color: primaryColor,
                      }}
                      className="max-w-full text-base font-medium capitalize line-clamp-3 poppins-regular "
                    >
                      {category.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </BottomPopUp>
    </>
  );
};

const MainTypes = memo(MemoMainTypes);
export default MainTypes;
