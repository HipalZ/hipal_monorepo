import React, { memo, useCallback, useMemo } from "react";
import { useSearch } from "@/components/store/useSearch";
import { BiArrowBack } from "react-icons/bi";
import HorizontalCard from "@/components/atoms/card/horizontalCard";
import { useActiveClass } from "@/components/store/useActiveClass";

const MemoSearchPanelCom = ({ allDishes }) => {
  const { searchText, setSearchText, setIsSearchActive } = useSearch();

  const { isActiveDishType } = useActiveClass();

  const filteredDishes = useMemo(() => {
    const typeMap: Record<string, string[]> = {
      all: [],
      nonveg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
      non_veg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
      veg: ["VEG", "ALCOHOL", "NON_ALCOHOL"],
      vegan: ["VEGAN", "ALCOHOL", "NON_ALCOHOL"],
      alcoholic: ["ALCOHOL"],
      nonalcoholic: ["NON_ALCOHOL"],
    };

    const allowedTypes = typeMap[isActiveDishType?.toLowerCase()] || [];

    const availableDishes = allDishes.filter(
      (dish) =>
        dish.visibility &&
        (isActiveDishType.toLowerCase() === "all" ||
          dish.dishTypes?.some((type) => allowedTypes.includes(type))),
    );

    if (!searchText) return availableDishes;

    return availableDishes.filter((dish) =>
      dish.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [searchText, allDishes, isActiveDishType]);

  const handleBack = useCallback(() => {
    setIsSearchActive(false);
  }, [setIsSearchActive]);

  return (
    <>
      <div className="flex items-center mt-4 ml-4 text-base">
        <BiArrowBack
          onClick={handleBack}
          size={24}
          className="cursor-pointer"
        />
        <input
          type="search"
          className="w-[92%] px-4 py-2 text-sm mx-4 border border-gray-300 rounded-md"
          placeholder="Search for dishes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div className="mt-4 overflow-y-auto max-h-[95dvh] min-h-[95dvh]">
        {filteredDishes.map((dish, index) => (
          <div
            key={`${dish._id}-${index}`}
            className="py-2 border-b cursor-pointer"
          >
            <HorizontalCard dishData={dish} />
          </div>
        ))}
      </div>
    </>
  );
};

const SearchPanelCom = memo(MemoSearchPanelCom);
export default SearchPanelCom;
