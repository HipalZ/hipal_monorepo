import type { IDish } from "@/components/types/businessData";
import dummyImage from "@/assets/hisite/placeholder.png";
import { memo, useEffect, type ChangeEvent, useMemo } from "react";
import { useExploreStore } from "@/components/store/useExploreStore";
import { cn } from "@/components/utils/helper";
import toast from "react-hot-toast";

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
  }, [uniquelyDishes]);

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => dish.images && dish.images.length > 0);
  }, [dishes]);

  const filteredOriginalDishes = useMemo(() => {
    return originalDishes.filter(
      (dish) => dish.images && dish.images.length > 0,
    );
  }, [originalDishes]);

  return (
    <div className="p-4 h-[80vh] overflow-auto">
      <center className="mb-4 text-2xl">
        Uniquely Yours{" "}
        <span className="text-sm">( {selectedDishes?.length}/7 )</span>
      </center>
      <span className="text-gray-500">Add Best dishes to explore page</span>
      <input
        type="search"
        onChange={handleSearch}
        value={searchQuery}
        className="w-full px-4 py-2 mt-4 mb-4 border border-gray-300 rounded-2xl"
        placeholder="Search for a dish"
      />
      <div className="gap-4 space-y-4">
        {filteredDishes.length > 0
          ? filteredDishes.map((dish) => {
              const isSelected = selectedDishes.some((d) => d._id === dish._id);
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
                      if (isSelected || selectedDishes.length < 7) {
                        handleDishSelect(dish);
                      } else {
                        toast.error("You can only select 7 dishes");
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
              const isSelected = selectedDishes.some((d) => d._id === dish._id);
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
                      if (isSelected || selectedDishes.length < 7) {
                        handleDishSelect(dish);
                      } else {
                        toast.error("You can only select 7 dishes");
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
      <section className="fixed bottom-4 left-6 right-6">
        <button onClick={handleSaveDish} type="button" className="action_btn">
          Save
        </button>
      </section>
    </div>
  );
};

const UniquelyYoursPopUp = memo(MemoUniquelyYoursPopUp);
export default UniquelyYoursPopUp;
