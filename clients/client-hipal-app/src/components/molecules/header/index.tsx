import { memo, useMemo, useState } from "react";
import { HiSearch } from "react-icons/hi";
import QuickFilter from "@/components/atoms/quickFilter";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import MemoDishData from "@/components/atoms/dishDescription";
import SearchPanelCom from "./searchPanelCom";

function Header({ categories }: { categories: CategoryType[] }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const openSearchModal = () => setIsSearchOpen(true);
  const closeSearchModal = () => setIsSearchOpen(false);

  return (
    <div
      className={`bg-base-100 rounded-t-2xl pt-4 transition-transform duration-300
         z-50 sticky top-0 flex flex-col space-y-2 text-4xl py-4 
         `}
    >
      <div className="relative flex items-center justify-between w-full ">
        <h3 className="ml-4 text-2xl">Menu</h3>
        <div className="flex items-center justify-around px-2">
          <div className="mt-1 mr-2">
            <QuickFilter />
          </div>
          <button
            type="button"
            className="btn btn-ghost bg-base-100 !h-8 !min-h-8 aspect-square !px-1 my-auto rounded-full"
          >
            <HiSearch
              onClick={openSearchModal}
              size={30}
              className="text-lg text-primary"
            />
          </button>
        </div>
      </div>
      {isSearchOpen && (
        <MemoDishData show={isSearchOpen} onClose={closeSearchModal}>
          <SearchPanelCom
            allDishes={allDishes}
            closeSearchModal={closeSearchModal}
          />
        </MemoDishData>
      )}
    </div>
  );
}

const MemoHeader = memo(Header);
export default MemoHeader;
