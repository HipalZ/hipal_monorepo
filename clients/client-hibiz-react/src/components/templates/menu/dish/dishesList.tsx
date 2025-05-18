import { memo, useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useMenuPageStore from "@/components/store/useMenuStorage";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useDishesStore } from "@/components/store/useDishesStore";
import type { DishType } from "@hi/db-models/src/validators";
import { useDishes } from "@/hooks/useDish";
import useBusinessData from "@/components/store/useBusinessData";
import MemoFoodType from "@/components/atom/FoodType";

const MemoListOfDishes = () => {
  const {
    search,
    visibilityFilter,
    sortOrder,
    setEditDish,
    setDishStep,
    setEditOpenMenu,
    setEditDishFunction,
  } = useMenuPageStore((state) => ({
    search: state.search,
    visibilityFilter: state.visibilityFilter,
    sortOrder: state.sortOrder,
    setEditDish: state.setEditDish,
    setDishStep: state.setDishStep,
    setEditOpenMenu: state.setEditOpenMenu,
    setEditDishFunction: state.setEditDishFunction,
  }));
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const { dishes } = useDishesStore((s) => ({
    dishes: s.dishes,
  }));

  const { isLoading } = useDishes();

  const fuse = new Fuse(dishes, {
    keys: ["name", "description"],
    threshold: 0.1,
  });

  // applying filters and using memo to avoid re-render
  const filteredDishes = useMemo(() => {
    // 1) Start with a copy of all dishes
    let filtered = dishes?.slice() || [];

    // 2) If user typed something, run Fuse
    if (search) {
      const fuseResults = fuse.search(search).map((r) => r.item);

      // De-duplicate items by _id
      const uniqueById = new Map();
      fuseResults.forEach((item) => uniqueById.set(item._id, item));

      filtered = Array.from(uniqueById.values());
    }

    // 3) Visibility filter
    if (visibilityFilter !== "all") {
      filtered = filtered.filter(
        (d) => d.visibility === (visibilityFilter === "visible"),
      );
    }

    // 4) Sorting
    switch (sortOrder) {
      case "asc":
        return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
      case "desc":
        return filtered.slice().sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [search, fuse, visibilityFilter, sortOrder, dishes]);

  // storing dish data for edit and opening edit menu popup
  const handleEditDish = useCallback(
    (dish: DishType) => {
      setEditDish(dish);
      setDishStep("DISH_STEP_1");
      setEditOpenMenu(true);
      setEditDishFunction(dish); // setting data for edit dish
    },
    [setEditDish, setDishStep, setEditOpenMenu, setEditDishFunction],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="flex relative flex-wrap justify-center mt-[7rem] gap-4 mx-4 lg:mt-[5rem]">
      <h3 className="absolute left-0 text-xl -top-[2.5rem] lg:-top-[3.5rem] font-semibold">
        {outLetType === "OTHER" ? "Services" : "Dishes"} (
        {filteredDishes?.length})
      </h3>
      {filteredDishes.length > 0 && filteredDishes
        ? filteredDishes.map((dish) => (
            <button
              onClick={() => handleEditDish(dish)}
              type="button"
              key={dish._id}
              className="flex items-center justify-between w-full p-3 gap-2 bg-white h-[4.5rem] rounded-2xl shadow md:max-w-[21rem] lg:max-w-[20rem] xl:max-w-[20rem] 2xl:max-w-[21.5rem]"
            >
              <MemoFoodType types={dish?.dishTypes} />
              <h3
                title={dish.name}
                className="mb-2 text-lg font-semibold text-left"
              >
                {dish.name}
              </h3>
              <div className="flex items-center mb-2 text-gray-500">
                {dish.visibility ? (
                  <FaEye className="text-green-500" />
                ) : (
                  <FaEyeSlash className="text-red-500" />
                )}
                {!dish.availability && (
                  <span className="ml-2 text-red-500">N/A</span>
                )}
              </div>
            </button>
          ))
        : null}
    </section>
  );
};
const ListOfDishes = memo(MemoListOfDishes);
export default ListOfDishes;
