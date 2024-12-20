"use client";
import { useActiveClass } from "@/components/store/useActiveClass";
import { cn } from "@hi/common";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { memo, useCallback, useMemo, useState } from "react";
import CustomModal from "./customModal";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useCartStore } from "@/components/store/useCartStore";
import Bell from "@/assets/cart/bell.png";
import Image from "next/image";
import { useSearch } from "@/components/store/useSearch";

interface IMainTypes {
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
}

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

const MemoMainTypes = (props: IMainTypes) => {
  const { parentCategory, childCategory } = props;
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cart } = useCartStore();

  const {
    isActiveParentCategory,
    setActiveParentCategory,
    setActiveCategory,
    setObserverActive,
    isActiveCategory,
    isActiveDishType,
    setActiveChildCategory,
  } = useActiveClass();

  const mainTypes = useMemo(
    () =>
      parentCategory?.filter((category) => category.subCategoryIds.length > 0),
    [parentCategory],
  );
  const { isSearchActive } = useSearch();
  const subTypes = useMemo(() => {
    return childCategory.filter((category) =>
      filterDishesByType(category, isActiveDishType),
    );
  }, [isActiveDishType]);

  const setMainCategory = useCallback(
    (category: CategoryType) => {
      setObserverActive(false);
      setActiveParentCategory(category._id?.toString() ?? "");
      setActiveCategory(category.subCategoryIds[0]?.toString() ?? "");
      setTimeout(() => {
        setObserverActive(true);
      }, 1000);
      setIsModalOpen(false);
    },
    [setActiveParentCategory, setActiveCategory, setObserverActive],
  );

  const setActiveCategories = useCallback(
    (category: CategoryType) => {
      setObserverActive(false);
      setActiveParentCategory(category.parentCategoryIds[0]?.toString() || "");
      setActiveCategory(category._id?.toString() || "");
      setActiveChildCategory(category._id?.toString() || "");

      const element = document.getElementById(category._id?.toString() || "");
      if (element) {
        element.style.scrollMarginTop = "110px";
        element.scrollIntoView({ behavior: "smooth" });
      }

      setTimeout(() => {
        setObserverActive(true);
      }, 1000);
    },
    [
      setActiveCategory,
      setActiveParentCategory,
      setActiveChildCategory,
      setObserverActive,
    ],
  );

  if (isSearchActive) return null;
  return (
    <>
      {mainTypes.length > 0 && outletInfo?.outLetType !== "OTHER" ? (
        <>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "sticky flex items-center rounded-r-xl justify-between px-4 py-3 text-[#FFF] max-w-[30rem] z-50  left-0  bg-[#000000]",
              cart.length > 0 ? "bottom-[8rem]" : "bottom-[5.25rem]",
            )}
          >
            <Image
              src={Bell}
              alt="bell"
              width={24}
              height={24}
              className="mr-2"
            />
            Menu
          </button>

          <CustomModal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="relative flex flex-col items-center justify-center p-4 !text-[#ffffff]">
              <h2 className="absolute mb-4 text-xl font-bold top-4">
                Categories
              </h2>
              <section className="mt-8 max-h-[50dvh] overflow-auto py-4 w-full hide-scrollbar">
                {mainTypes.length > 0 && (
                  <div className="flex flex-col items-center w-full space-y-4">
                    {mainTypes
                      .filter((item) => item?.visibility)
                      .map((item: CategoryType) => (
                        <button
                          type="button"
                          key={item._id?.toString()}
                          onClick={() => setMainCategory(item)}
                          className={cn(
                            isActiveParentCategory === item._id?.toString()
                              ? " text-[#ffffff] font-bold"
                              : " text-[#ffffff]",
                            "px-4 w-full flex justify-between items-center",
                          )}
                        >
                          <h3>{item.name}</h3>
                          <h4>{item.subCategoryIds?.length}</h4>
                        </button>
                      ))}
                  </div>
                )}
              </section>
            </div>
          </CustomModal>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "sticky flex items-center rounded-r-xl justify-between px-4 py-3 text-[#FFF] max-w-[30rem] z-50  left-0  bg-[#000000]",
              cart.length > 0 ? "bottom-[8rem]" : "bottom-[5.25rem]",
            )}
          >
            <Image
              src={Bell}
              alt="bell"
              width={24}
              height={24}
              className="mr-2"
            />
            Menu
          </button>

          <CustomModal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="relative flex flex-col items-center justify-center p-4 !text-[#ffffff]">
              <h2 className="absolute mb-4 text-xl font-bold top-4">
                Categories
              </h2>
              <section className="mt-8 max-h-[50dvh] overflow-auto py-4 w-full hide-scrollbar">
                {subTypes.length > 0 && (
                  <div className="flex flex-col items-center w-full space-y-4">
                    {subTypes
                      .filter((item) => item?.visibility)
                      .map((item: CategoryType) => (
                        <button
                          type="button"
                          key={item._id?.toString()}
                          onClick={() => setActiveCategories(item)}
                          className={cn(
                            isActiveCategory === item._id?.toString()
                              ? " text-[#ffffff] font-bold"
                              : " text-[#ffffff]",
                            "px-4 w-full flex justify-between items-center",
                          )}
                        >
                          <h3>{item.name}</h3>
                          <h4>{item.dishIds?.length}</h4>
                        </button>
                      ))}
                  </div>
                )}
              </section>
            </div>
          </CustomModal>
        </>
      )}
    </>
  );
};

const MainTypes = memo(MemoMainTypes);
export default MainTypes;
