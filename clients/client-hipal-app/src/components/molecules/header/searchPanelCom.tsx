import React, { useMemo } from "react";
import MemoHorizontalCard from "@/components/atoms/card/horizontalCard";
import { useSearch } from "@/components/store/useSearch";
import { BiArrowBack } from "react-icons/bi";

const SearchPanelCom = ({ allDishes }) => {
  const { searchText, setSearchText, setIsSearchActive, setShowHeader } =
    useSearch();

  const filteredDishes = useMemo(() => {
    if (!searchText) return allDishes;
    return allDishes.filter((dish) =>
      dish.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [searchText, allDishes]);

  return (
    <>
      <div className="flex items-center mt-4 ml-4 text-base">
        <BiArrowBack onClick={() => setIsSearchActive(false)} size={24} />
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
              <MemoHorizontalCard
                dishData={dish}
                key={`${dish._id} + ${index}`}
              />
            </div>
          ),
        )}
      </div>
    </>
  );
};

export default SearchPanelCom;
