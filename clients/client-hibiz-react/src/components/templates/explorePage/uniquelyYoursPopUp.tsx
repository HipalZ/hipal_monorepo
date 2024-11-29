import type { IDish } from "@/components/types/businessData";
import { memo, type ChangeEvent, useMemo, useCallback, useEffect } from "react";
import { useExploreStore } from "@/components/store/useExploreStore";
import toast from "react-hot-toast";
import Fuse from "fuse.js";
import dummyImage from "@/assets/hisite/placeholder.png";
import { apiRpc } from "@hi/common";
import { useParams } from "react-router-dom";
import { useExploreTemp } from "@/components/store/useExploreTemp";

const MemoUniquelyYoursPopUp = () => {
  const businessId = useParams()?.businessId;
  const { setDishes, dishes } = useExploreTemp((s) => ({
    setDishes: s.setDishes,
    dishes: s.dishes,
  }));
  const {
    originalDishes,
    searchQuery,
    setSearchQuery,
    uniquelyDishes,
    setUniquelyDishes,
    showUniquePopUp,
    setShowUniquePopUp,
  } = useExploreStore((s) => ({
    originalDishes: s.originalDishes,
    searchQuery: s.searchQuery,
    setSearchQuery: s.setSearchQuery,
    uniquelyDishes: s.uniquelyDishes,
    setUniquelyDishes: s.setUniquelyDishes,
    showUniquePopUp: s.showUniquePopUp,
    setShowUniquePopUp: s.setShowUniquePopUp,
  }));

  const { selectedDishes, setSelectedDishes } = useExploreTemp((s) => ({
    selectedDishes: s.selectedDishes,
    setSelectedDishes: s.setSelectedDishes,
  }));

  useEffect(() => {
    setSelectedDishes(uniquelyDishes);
  }, []);

  // dishes are displaying dishes duplicate of originalDishes
  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const search = e.target.value;
      setSearchQuery(search);
      const dishesData = dishes.filter((dish) =>
        dish.name.toLowerCase().includes(search.toLowerCase()),
      );
      setDishes(dishesData);
      if (search.trim() === "") {
        setDishes(originalDishes);
      }
    },
    [setSearchQuery, setDishes, dishes, originalDishes],
  );

  // Function to handle dish selection
  const handleDishSelect = useCallback(
    (selectedDish: IDish) => {
      const isAlreadySelected = selectedDishes.some(
        (dish) => dish?._id === selectedDish._id,
      );
      let updatedSelectedDishes: IDish[];
      if (isAlreadySelected) {
        updatedSelectedDishes = selectedDishes.filter(
          (dish) => dish?._id !== selectedDish._id,
        );
      } else {
        updatedSelectedDishes = [...selectedDishes, selectedDish];
      }

      setSelectedDishes(updatedSelectedDishes);
    },
    [selectedDishes, setSelectedDishes],
  );

  // saving uniquely yours dishes
  const handleSaveDish = useCallback(async () => {
    setUniquelyDishes(selectedDishes);
    await handleUniquelyYours(selectedDishes);
    setShowUniquePopUp(false);
  }, [selectedDishes, showUniquePopUp, setUniquelyDishes]);

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

  const fuse = new Fuse(originalDishes, {
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
        ...dishes.filter(
          (dish) => !selectedDishes.some((d) => d.name === dish.name),
        ),
      ];
    }

    return combinedDishes;
  }, [dishes, selectedDishes, searchQuery, fuse]);

  return (
    <div className="relative px-4 pb-[5rem] h-[80dvh] overflow-auto">
      <div className="sticky top-0 mt-4 bg-base-100">
        <center className="mb-4 text-2xl">
          Uniquely Yours{" "}
          <span className="text-sm">( {selectedDishes?.length}/6 )</span>
        </center>
        <span className="text-gray-500">Add Best Items to explore page </span>
        <span className="text-xs text-gray-500">
          ( Note : Only Items with Images are displayed )
        </span>
        <input
          type="search"
          onChange={handleSearch}
          value={searchQuery}
          className="w-full px-4 py-2 mt-4 mb-4 border border-gray-300 rounded-2xl"
          placeholder="Search for a items"
        />
      </div>
      <div className="gap-4 space-y-4">
        {displayedDishes && displayedDishes.length > 0 ? (
          displayedDishes.map((dish) => {
            const isSelected = selectedDishes.some((d) => d.name === dish.name);
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
                      toast.error("You can only select 6 items");
                    }
                  }}
                />
                {dish.images.length > 0 ? (
                  <img
                    loading="lazy"
                    src={dish.images[0] || dummyImage}
                    alt={`Dish ${dish._id}`}
                    className="h-[4rem] w-[4rem] border-2 rounded-md"
                  />
                ) : (
                  <center className="text-gray-500">
                    Add images to the items to display here
                  </center>
                )}
                <h6>{dish?.name}</h6>
              </div>
            );
          })
        ) : originalDishes.length > 0 ? (
          originalDishes.map((dish) => {
            const isSelected = selectedDishes.some((d) => d.name === dish.name);
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
                {dish.images.length > 0 ? (
                  <img
                    loading="lazy"
                    src={dish.images[0] || dummyImage}
                    alt={`Dish ${dish._id}`}
                    className="h-[4rem] w-[4rem] border-2 rounded-md"
                  />
                ) : (
                  <span className="text-gray-500">
                    Add some images to view here
                  </span>
                )}
                <h6>{dish?.name}</h6>
              </div>
            );
          })
        ) : (
          <center className="text-gray-500 ">
            Add some images to the dishes to view here
          </center>
        )}
      </div>
      <button onClick={handleSaveDish} type="button" className="bottom_btn">
        Save
      </button>
    </div>
  );
};

const UniquelyYoursPopUp = memo(MemoUniquelyYoursPopUp);
export default UniquelyYoursPopUp;
