import { memo, useMemo } from "react";
import QuickFilter from "@/components/atoms/quickFilter";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import SearchPanelCom from "./searchPanelCom";
import { useSearch } from "@/components/store/useSearch";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

function Header({ categories }: { categories: CategoryType[] }) {
  const { isSearchActive, showHeader } = useSearch();

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

  return (
    <div
      className={`${
        showHeader
          ? "sticky top-0 z-50 bg-[#ffffff] opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full"
      } transition-all duration-300 ease-in-out flex flex-col space-y-2 text-4xl py-2 text-black overflow-hidden`}
    >
      <div className="relative flex flex-col items-start justify-between w-full overflow-hidden">
        <h3 className="ml-2 text-2xl">
          {outletInfo?.outLetType === "OTHER" ? "Catalogue" : "Menu"}
        </h3>
        {outletInfo?.outLetType !== "OTHER" && (
          <div className="mt-1 mr-2">
            <QuickFilter />
          </div>
        )}
      </div>
      {isSearchActive && <SearchPanelCom allDishes={allDishes} />}
    </div>
  );
}

const MemoHeader = memo(Header);
export default MemoHeader;
