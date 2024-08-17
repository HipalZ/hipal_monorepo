import { memo, useCallback, useMemo } from "react";
import { HiSearch } from "react-icons/hi";
import QuickFilter from "@/components/atoms/quickFilter";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import SearchPanelCom from "./searchPanelCom";
import { useSearch } from "@/components/store/useSearch";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

function Header({
  categories,
  showHeader,
}: { categories: CategoryType[]; showHeader?: boolean }) {
  const { isSearchActive, setIsSearchActive } = useSearch();

  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const allDishes: DishType[] = useMemo(() => {
    const getDishesFromCategory = (category: CategoryType): DishType[] => {
      let dishes: DishType[] = category.dishIds || [];
      if (category.subCategoryIds && category.subCategoryIds.length > 0) {
        for (const subCategory of category.subCategoryIds) {
          dishes = [...dishes, ...getDishesFromCategory(subCategory)];
        }
      }
      return dishes;
    };

    return categories.reduce((acc, category) => {
      return [...acc, ...getDishesFromCategory(category)];
    }, []);
  }, [categories]);

  const openSearchModal = useCallback(
    () => setIsSearchActive(true),
    [isSearchActive],
  );

  return (
    <div
      className={`${
        showHeader
          ? "sticky top-0 z-50 bg-base-200 opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full"
      } transition-all duration-300 ease-in-out flex flex-col space-y-2 text-4xl py-2 text-primary overflow-hidden`}
    >
      <div className="relative flex items-center justify-between w-full overflow-hidden">
        <h3 className="ml-2 text-2xl">
          {outletInfo?.outLetType === "OTHER" ? "Catalogue" : "Menu"}
        </h3>
        {outletInfo?.outLetType !== "OTHER" && (
          <div className="flex items-center justify-around px-2">
            <div className="mt-1 mr-2">
              <QuickFilter />
            </div>
            <button
              type="button"
              className="btn btn-ghost bg-base-100 !h-8 !min-h-8 aspect-square !px-1 my-auto rounded-full"
            >
              {!isSearchActive && (
                <HiSearch
                  onClick={openSearchModal}
                  size={24}
                  className="text-lg text-primary"
                />
              )}
            </button>
          </div>
        )}
      </div>
      {isSearchActive && <SearchPanelCom allDishes={allDishes} />}
    </div>
  );
}

const MemoHeader = memo(Header);
export default MemoHeader;
