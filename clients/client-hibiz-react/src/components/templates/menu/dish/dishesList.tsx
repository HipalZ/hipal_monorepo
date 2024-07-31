import { memo, useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useMenuPageStore from "@/components/store/useMenuStorage";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useDishesStore } from "@/components/store/useDishesStore";
import type { DishType } from "@hi/db-models/src/validators";
import { useDishStore } from "@/hooks/useDishStore";

const MemoListOfDishes = () => {
  const {
    search,
    visibilityFilter,
    sortOrder,
    setEditDish,
    setDishStep,
    dishStep,
    editOpenMenu,
    setEditOpenMenu,
    setEditDishFunction,
  } = useMenuPageStore((state) => ({
    search: state.search,
    visibilityFilter: state.visibilityFilter,
    sortOrder: state.sortOrder,
    setEditDish: state.setEditDish,
    dishStep: state.dishStep,
    setDishStep: state.setDishStep,
    editOpenMenu: state.editOpenMenu,
    setEditOpenMenu: state.setEditOpenMenu,
    setEditDishFunction: state.setEditDishFunction,
  }));

  const { dishes } = useDishesStore((s) => ({
    dishes: s.dishes,
  }));

  const { isLoading } = useDishStore();

  const fuse = useMemo(
    () =>
      new Fuse(dishes, {
        keys: ["name"],
        threshold: 0.3,
      }),
    [dishes],
  );

  const filteredDishes = useMemo(() => {
    let filtered = search
      ? fuse.search(search).map((result) => result.item)
      : dishes;
    if (visibilityFilter !== "all") {
      filtered = filtered.filter(
        (c) => c.visibility === (visibilityFilter === "visible"),
      );
    }
    if (Object.keys(filtered).length === 0) return [];
    return sortOrder === "asc"
      ? filtered?.sort((a, b) => a?.name?.localeCompare(b?.name))
      : filtered?.sort((a, b) => b?.name?.localeCompare(a?.name));
  }, [search, dishes, fuse, visibilityFilter, sortOrder]);

  const handleEditDish = useCallback(
    (dish: DishType) => {
      setEditDish(dish);
      setDishStep("DISH_STEP_1");
      setEditOpenMenu(true);
      setEditDishFunction(dish);
    },
    [dishStep, editOpenMenu],
  );

  if (isLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <section className="flex flex-wrap justify-center mt-[7rem] gap-4 mx-4 lg:mt-[5rem]">
      {filteredDishes
        ? filteredDishes.map((dish) => (
            <button
              onClick={() => handleEditDish(dish)}
              type="button"
              key={dish.name}
              className="flex items-center justify-between w-full p-4 bg-white h-[4.5rem] rounded-2xl shadow max-w-[28rem] md:max-w-[22rem]"
            >
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
