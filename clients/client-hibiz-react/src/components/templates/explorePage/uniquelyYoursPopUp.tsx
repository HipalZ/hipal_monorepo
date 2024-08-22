import type { IDish } from "@/components/types/businessData";
import { memo, useEffect, type ChangeEvent, useMemo, useCallback } from "react";
import { useExploreStore } from "@/components/store/useExploreStore";
import { cn } from "@/components/utils/helper";
import toast from "react-hot-toast";
import Fuse from "fuse.js";
import { apiRpc } from "@hi/common";
import { useParams } from "react-router-dom";

const MemoUniquelyYoursPopUp = () => {
  const businessId = useParams()?.businessId;
  const {
    originalDishes,
    dishes,
    uniquelyDishes,
    setSelectedDishes,
    selectedDishes,
    searchQuery,
    setSearchQuery,
    setDishes,
    setUniquelyDishes,
    showUniquePopUp,
    setShowUniquePopUp,
  } = useExploreStore((s) => ({
    originalDishes: s.originalDishes,
    dishes: s.dishes,
    uniquelyDishes: s.uniquelyDishes,
    setSelectedDishes: s.setSelectedDishes,
    selectedDishes: s.selectedDishes,
    searchQuery: s.searchQuery,
    setSearchQuery: s.setSearchQuery,
    setDishes: s.setDishes,
    setUniquelyDishes: s.setUniquelyDishes,
    showUniquePopUp: s.showUniquePopUp,
    setShowUniquePopUp: s.setShowUniquePopUp,
  }));

  useEffect(() => {
    setSelectedDishes(uniquelyDishes);
  }, []);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setSearchQuery(search);
    const filteredDishes = dishes.filter((dish) =>
      dish.name.toLowerCase().includes(search.toLowerCase()),
    );
    setDishes(filteredDishes);
    if (search.trim() === "") {
      setDishes(originalDishes);
    }
  }, []);

  const handleDishSelect = useCallback(
    (selectedDish: IDish) => {
      const isAlreadySelected = selectedDishes.some(
        (dish) => dish._id === selectedDish._id,
      );
      let updatedSelectedDishes: IDish[];
      if (isAlreadySelected) {
        updatedSelectedDishes = selectedDishes.filter(
          (dish) => dish._id !== selectedDish._id,
        );
      } else {
        updatedSelectedDishes = [...selectedDishes, selectedDish];
      }

      setSelectedDishes(updatedSelectedDishes);
    },
    [selectedDishes],
  );

  const handleSaveDish = useCallback(async () => {
    setUniquelyDishes(selectedDishes);
    await handleUniquelyYours(selectedDishes);
    setShowUniquePopUp(false);
  }, [selectedDishes, showUniquePopUp]);

  const handleUniquelyYours = async (selectedDishes: IDish[]) => {
    apiRpc.dishes.uniquelyYours.$post({
      json: {
        dishArray: selectedDishes.map((dish) => {
          return {
            dishId: dish._id,
            name: dish.name,
            images: dish.images,
            dishTypes: dish?.dishTypes,
            businessId,
          };
        }),
      },
    });
  };

  // Function to filter unique dishes with images
  const getUniqueDishesWithImages = useCallback((dishesList: IDish[]) => {
    const uniqueDishesMap = new Map();
    for (const dish of dishesList) {
      if (
        dish.images &&
        dish.images.length > 0 &&
        !uniqueDishesMap.has(dish.name)
      ) {
        uniqueDishesMap.set(dish.name, dish);
      }
    }
    return Array.from(uniqueDishesMap.values());
  }, []);

  const filteredOriginalDishes = useMemo(() => {
    return getUniqueDishesWithImages(originalDishes);
  }, [originalDishes]);

  const filteredDishes = useMemo(() => {
    return getUniqueDishesWithImages(dishes);
  }, [dishes]);

  const fuse = new Fuse(dishes, {
    keys: ["name"],
    threshold: 0.3,
  });

  const displayedDishes = useMemo(() => {
    let combinedDishes;

    if (searchQuery) {
      combinedDishes = fuse.search(searchQuery).map((result) => result.item);
    } else {
      // Show both selected dishes and all available dishes when the search query is empty
      combinedDishes = [
        ...selectedDishes,
        ...filteredDishes.filter(
          (dish) => !selectedDishes.some((d) => d.name === dish.name),
        ),
      ];
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
