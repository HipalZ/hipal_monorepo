import type { IDish } from "@/components/types/businessData";
import dummyImage from "@/assets/hisite/placeholder.png";
import { memo, useEffect, type ChangeEvent } from "react";
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
  console.log("selectedDise", selectedDishes);
  useEffect(() => {
    setSelectedDishes(uniquelyDishes);
  }, [uniquelyDishes]);
  return (
    <div className="p-4 h-[80vh] overflow-auto">
      <center className="mb-4 text-2xl">
        Uniquely Yours{" "}
        <span className="text-sm">( {selectedDishes?.length}/7 )</span>
      </center>
      <input
        type="search"
        onChange={handleSearch}
        value={searchQuery}
        className="w-full p-2 mb-4 border border-gray-300 rounded-2xl"
        placeholder="Search for a dish"
      />
      <div className="gap-4">
        {dishes.length > 0
          ? dishes.map((dish) => {
              const isSelected = selectedDishes.some((d) => d._id === dish._id);
              return (
                <div
                  key={dish._id}
                  className="flex items-center space-x-4 space-y-4 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="text-black rounded-md"
                    checked={selectedDishes.some((d) => d._id === dish._id)}
                    onChange={() => {
                      if (isSelected || selectedDishes.length < 7) {
                        handleDishSelect(dish);
                      } else {
                        toast.error("You can only select 7 dishes");
                      }
                    }}
                  />
                  {dish?.images && dish?.images?.length > 0 ? (
                    <img
                      loading="lazy"
                      src={dish.images[0]}
                      alt={`Dish ${dish._id}`}
                      className="h-[5rem] w-[5rem] border-2 rounded-md"
                    />
                  ) : (
                    <img
                      loading="lazy"
                      src={dummyImage}
                      alt={`Dish ${dish._id}`}
                      className="h-[5rem] w-[5rem] border-2 rounded-md"
                    />
                  )}
                  <h1>{dish?.name}</h1>
                </div>
              );
            })
          : originalDishes.map((dish) => {
              const isSelected = selectedDishes.some((d) => d._id === dish._id);
              return (
                <div
                  key={dish._id}
                  className={cn(
                    "flex items-center space-x-4 space-y-4 cursor-pointer",
                  )}
                >
                  <input
                    type="checkbox"
                    className="text-black rounded-md"
                    checked={selectedDishes.some((d) => d._id === dish._id)}
                    onChange={() => {
                      if (isSelected || selectedDishes.length < 7) {
                        handleDishSelect(dish);
                      } else {
                        toast.error("You can only select 7 dishes");
                      }
                    }}
                  />
                  {dish?.images && dish?.images?.length > 0 ? (
                    <img
                      loading="lazy"
                      src={dish.images[0]}
                      alt={`Dish ${dish._id}`}
                      className="h-[5rem] w-[5rem] border-2 rounded-md"
                    />
                  ) : (
                    <img
                      loading="lazy"
                      src={dummyImage}
                      alt={`Dish ${dish._id}`}
                      className="h-[5rem] w-[5rem] border-2 rounded-md"
                    />
                  )}
                  <h1>{dish?.name}</h1>
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
