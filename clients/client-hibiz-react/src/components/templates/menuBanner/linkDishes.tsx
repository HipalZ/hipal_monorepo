import Fuse from "fuse.js";
import { useMenuBanner } from "@/components/store/useMenuBanners";
import { memo, useMemo, useCallback } from "react";
import ShimmerImage from "../shimmer";
import { HiX } from "react-icons/hi";
import BottomButton from "@/components/atom/bottomButton";
import { useDishesStore } from "@/components/store/useDishesStore";
import { cn } from "@hi/common";
import toast from "react-hot-toast";
import type { IDish } from "@/components/types/businessData";

const MemoLinkDishes = () => {
  const { selectedDishes, addDish, removeDish, searchItem, setMenuBannerType } =
    useMenuBanner((s) => ({
      selectedDishes: s.selectedDishes,
      addDish: s.addDish,
      removeDish: s.removeDish,
      searchItem: s.searchItem,
      setSearchItem: s.setSearchItem,
      setMenuBannerType: s.setMenuBannerType,
    }));

  const { dishes } = useDishesStore((s) => ({
    dishes: s.dishes,
  }));

  const fuse = useMemo(() => {
    return new Fuse(dishes, {
      keys: ["name"],
      threshold: 0.3,
    });
  }, [dishes]);

  const filteredDishes = useMemo(() => {
    if (searchItem.length > 1) {
      const result = fuse.search(searchItem);
      return result.map((r) => r.item);
    }
    return dishes;
  }, [searchItem, fuse, dishes]) as IDish[];

  const handleDishSelection = useCallback(
    (dishId: string) => {
      if (selectedDishes.includes(dishId)) {
        removeDish(dishId);
      } else if (selectedDishes.length < 7) {
        addDish(dishId);
      } else {
        toast.error("You can only select up to 7 dishes.");
      }
    },
    [selectedDishes, addDish, removeDish],
  );

  const saveDishes = useCallback(() => {
    setMenuBannerType("CREATE");
  }, []);

  return (
    <section>
      {selectedDishes.length > 0 && (
        <>
          <h3 className="mt-2 ml-4 text-lg font-semibold opacity-50">
            Selected Dishes
          </h3>
          <div className="w-[88%] md:w-[94%] mx-6 grid grid-cols-1 md:grid-cols-3 gap-x-4 pb-4">
            {selectedDishes.map((dishId: string) => {
              const dish = dishes.find((d) => d._id === dishId) as IDish;
              return dish ? (
                <div
                  key={dish._id}
                  className="relative flex items-center h-[4rem] justify-between w-full px-4 py-3 mt-3 text-left bg-white rounded-lg shadow-md"
                >
                  <div className=" w-[90%] lg:w-[80%] md:w-[80%]">
                    {dish.name}
                  </div>
                  <div className="absolute right-4">
                    <ShimmerImage
                      src={dish.images[0]}
                      alt={dish.name}
                      width={50}
                      height={50}
                      className="rounded-lg"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDish(dish._id)}
                    className="absolute flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full -top-2 -right-2"
                  >
                    <HiX />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </>
      )}
      {filteredDishes.length > 0 ? (
        <>
          <h3 className="mt-2 ml-4 text-lg font-semibold opacity-50">
            Un-Selected Dishes
          </h3>

          <div className="w-[92%] pb-[5rem] md:w-[97%] mx-4 grid grid-cols-1 md:grid-cols-3 gap-x-4 hide-scrollbar">
            {filteredDishes.map((dish) => (
              <button
                type="button"
                key={dish._id}
                onClick={() => handleDishSelection(dish._id)}
                className={cn(
                  dish._id && selectedDishes.includes(dish._id)
                    ? "bg-green-100"
                    : " bg-white",
                  "relative flex items-center h-[5rem] hide-scrollbar justify-between w-full px-4 py-3 mt-3 text-left rounded-lg shadow-md",
                )}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedDishes.includes(dish._id)}
                    disabled={
                      selectedDishes.length >= 7 &&
                      !selectedDishes.includes(dish._id)
                    }
                    className="mr-2 text-black rounded"
                  />
                  <div className="flex-2 w-[90%] lg:w-[80%] md:w-[60%]">
                    {dish.name}
                  </div>
                </div>
                <div className="absolute right-4">
                  <ShimmerImage
                    src={dish.images[0]}
                    alt={dish.name}
                    width={50}
                    height={50}
                    className="rounded-lg"
                  />
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <p>No dishes available with images</p>
      )}

      <BottomButton
        fixed
        buttons={[
          {
            text: "Save",
            onClick: saveDishes,
          },
        ]}
      />
    </section>
  );
};

const LinkDishes = memo(MemoLinkDishes);
export default LinkDishes;
