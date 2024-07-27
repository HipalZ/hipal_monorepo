import React, { useState, useMemo } from "react";
import MemoHorizontalCard from "@/components/atoms/card/horizontalCard";

const SearchPanelCom = ({ allDishes, closeSearchModal }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDishes = useMemo(() => {
    if (!searchQuery) return allDishes;
    return allDishes.filter((dish) =>
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, allDishes]);

  console.log("filteredDishes", filteredDishes);

  return (
    <>
      <div className="mt-4 ">
        <input
          type="search"
          className="w-[92%] px-4 py-2 mx-4 border border-gray-300 rounded-md"
          placeholder="Search for dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="mt-4 overflow-y-auto max-h-[80dvh] min-h-[80dvh]">
        {(searchQuery.length > 0 ? filteredDishes : allDishes).map(
          (dish, index) => (
            <div
              key={`${dish._id} + ${index}`}
              className="py-2 border-b cursor-pointer"
            >
              <MemoHorizontalCard dishData={dish} key={`${dish._id} + ${index}`} />
            </div>
          ),
        )}
      </div>
    </>
  );
};

export default SearchPanelCom;
