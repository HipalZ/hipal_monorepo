import type { IDish } from "@/components/types/businessData";
import { memo, useEffect, type ChangeEvent, useMemo } from "react";
import { useExploreStore } from "@/components/store/useExploreStore";
import { cn } from "@/components/utils/helper";
import toast from "react-hot-toast";
import Fuse from "fuse.js";

interface IUniqueProps {
  dishes: IDish[];
  uniquelyDishes: IDish[];
  selectedDishes: IDish[];
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  searchQuery: string;
  handleDishSelect: (dish: IDish) => void;
  handleSaveDish: () => void;
  setSelectedDishes: (dishes: IDish[]) => void;
}

const MemoUniquelyYoursPopUp = (props: IUniqueProps) => {
  const { originalDishes } = useExploreStore((s) => ({
    originalDishes: s.originalDishes,
  }));

  const {
    uniquelyDishes,
    dishes,
    setSelectedDishes,
    selectedDishes,
    handleSearch,
    searchQuery,
    handleDishSelect,
    handleSaveDish,
  } = props;

  useEffect(() => {
    setSelectedDishes(uniquelyDishes);
  }, []);

  // Function to filter unique dishes with images
  const getUniqueDishesWithImages = (dishesList: IDish[]) => {
    const uniqueDishesMap = new Map();
    for (const dish of dishesList) {
      if (
        dish.images &&
        dish.images.length > 0 &&
        !uniqueDishesMap.has(dish._name)
      ) {
        uniqueDishesMap.set(dish.name, dish);
      }
    }
    return Array.from(uniqueDishesMap.values());
  };

  const filteredOriginalDishes = useMemo(() => {
    return getUniqueDishesWithImages(originalDishes);
  }, [originalDishes]);

  const filteredDishes = useMemo(() => {
    return getUniqueDishesWithImages(dishes);
  }, [dishes]);

  const fuse = useMemo(() => {
    return new Fuse([...selectedDishes, ...filteredDishes], {
      keys: ["name"],
      includeScore: true,
      threshold: 0.3,
    });
  }, [selectedDishes, filteredDishes]);

  const displayedDishes = useMemo(() => {
    let combinedDishes = [
      ...selectedDishes,
      ...filteredDishes.filter(
        (dish) => !selectedDishes.some((d) => d.name === dish.name),
      ),
    ];
    if (searchQuery) {
      combinedDishes = fuse.search(searchQuery).map((result) => result.item);
    }
    return combinedDishes;
  }, [filteredDishes, selectedDishes, searchQuery, fuse]);

  return (
    <div className="relative px-4 pb-[5rem] h-[80dvh] overflow-auto">
      <div className="sticky top-0 mt-4 bg-base-100">
        <center className="mb-4 text-2xl">
          Uniquely Yours{" "}
          <span className="text-sm">( {selectedDishes?.length}/6 )</span>
        </center>
        <span className="text-gray-500">Add Best dishes to explore page</span>
        <input
          type="search"
          onChange={handleSearch}
          value={searchQuery}
          className="w-full px-4 py-2 mt-4 mb-4 border border-gray-300 rounded-2xl"
          placeholder="Search for a dish"
        />
      </div>
      <div className="gap-4 space-y-4">
        {displayedDishes.length > 0
          ? displayedDishes.map((dish) => {
              const isSelected = selectedDishes.some(
                (d) => d.name === dish.name,
              );
              return (
                <div
                  key={dish._id}
                  className="flex items-center space-x-4 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="text-black rounded-md"
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected || selectedDishes.length < 6) {
                        handleDishSelect(dish);
                      } else {
                        toast.error("You can only select 6 dishes");
                      }
                    }}
                  />
                  <img
                    loading="lazy"
                    src={dish.images[0]}
                    alt={`Dish ${dish._id}`}
                    className="h-[4rem] w-[4rem] border-2 rounded-md"
                  />
                  <h6>{dish?.name}</h6>
                </div>
              );
            })
          : filteredOriginalDishes.map((dish) => {
              const isSelected = selectedDishes.some(
                (d) => d.name === dish.name,
              );
              return (
                <div
                  key={dish._id}
                  className={cn("flex items-center space-x-4 cursor-pointer")}
                >
                  <input
                    type="checkbox"
                    className="text-black rounded-md"
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected || selectedDishes.length < 6) {
                        handleDishSelect(dish);
                      } else {
                        toast.error("You can only select 6 dishes");
                      }
                    }}
                  />
                  <img
                    loading="lazy"
                    src={dish.images[0]}
                    alt={`Dish ${dish._id}`}
                    className="h-[4rem] w-[4rem] border-2 rounded-md"
                  />
                  <h6>{dish?.name}</h6>
                </div>
              );
            })}
      </div>
      <button onClick={handleSaveDish} type="button" className="bottom_btn">
        Save
      </button>
    </div>
  );
};

const UniquelyYoursPopUp = memo(MemoUniquelyYoursPopUp);
export default UniquelyYoursPopUp;
