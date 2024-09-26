import React, { memo, useCallback, useMemo } from "react";
import { useSearch } from "@/components/store/useSearch";
import { BiArrowBack } from "react-icons/bi";
import HorizontalCard from "@/components/atoms/card/horizontalCard";

const MemoSearchPanelCom = ({ allDishes }) => {
  const {
    searchText,
    isSearchActive,
    showHeader,
    setSearchText,
    setIsSearchActive,
    setShowHeader,
  } = useSearch();

  const filteredDishes = useMemo(() => {
    if (!searchText) return allDishes;
    return allDishes.filter((dish) =>
      dish.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [searchText, allDishes]);

  const handleBack = useCallback(() => {
    setIsSearchActive(false);
    setShowHeader(false);
  }, [isSearchActive, showHeader]);

  return (
    <>
      <div className="flex items-center mt-4 ml-4 text-base">
        <BiArrowBack onClick={handleBack} size={24} />
        <input
          type="search"
          className="w-[92%] px-4 py-2 text-sm mx-4 border border-gray-300 rounded-md"
          placeholder="Search for dishes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div className="mt-4 overflow-y-auto max-h-[95dvh] min-h-[95dvh]">
        {(searchText.length > 0 ? filteredDishes : allDishes).map(
          (dish, index) => (
            <div
              key={`${dish._id} + ${index}`}
              className="py-2 border-b cursor-pointer"
            >
              <HorizontalCard dishData={dish} key={`${dish._id} + ${index}`} />
            </div>
          ),
        )}
      </div>
    </>
  );
};

const SearchPanelCom = memo(MemoSearchPanelCom);
export default SearchPanelCom;
