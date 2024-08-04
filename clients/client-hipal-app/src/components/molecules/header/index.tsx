import { memo, useMemo } from "react";
import { HiSearch } from "react-icons/hi";
import QuickFilter from "@/components/atoms/quickFilter";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import SearchPanelCom from "./searchPanelCom";
import { useSearch } from "@/components/store/useSearch";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

function Header({ categories }: { categories: CategoryType[] }) {
  const { isSearchActive, setIsSearchActive } = useSearch();

  const outletInfo = _useAllBusiness(s=>s.data.outletInfo)

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

  const openSearchModal = () => setIsSearchActive(true);

  return (
    <div
      className={`bg-base-100 pt-4 transition-transform duration-300
         z-50 sticky top-0 flex flex-col space-y-2 text-4xl py-2 text-primary
         `}
    >
      <div className="relative flex items-center justify-between w-full overflow-hidden">
        <h3 className="ml-4 text-2xl">{outletInfo.outLetType === "OTHER" ? "Catalogue":"Menu"}</h3>
        {
          outletInfo.outLetType !== "OTHER" && (
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
          )
        }
        {/* <div className="flex items-center justify-around px-2">
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
        </div> */}
      </div>
      {isSearchActive && <SearchPanelCom allDishes={allDishes} />}
    </div>
  );
}

const MemoHeader = memo(Header);
export default MemoHeader;
