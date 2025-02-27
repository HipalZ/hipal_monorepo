import { memo, useCallback, useMemo, useState } from "react";
import Fuse from "fuse.js";
import useMenuPageStore from "@/components/store/useMenuStorage";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useDishesStore } from "@/components/store/useDishesStore";
import type { DishType } from "@hi/db-models/src/validators";
import { useDishes, useLinkedDishes } from "@/hooks/useDish";
import DishButton from "./dishesManagerCard";
import MiddlePopUp from "@/components/atom/middlePopUp";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

const MemoDishesManager = () => {
  const [showPopUp, setShowPopUp] = useState(false);
  const [openCategoryIds, setOpenCategoryIds] = useState({});
  const {
    search,
    visibilityFilter,
    sortOrder,
    setEditDish,
    setDishStep,
    dishStep,
    setEditOpenMenu,
    setEditDishFunction,
  } = useMenuPageStore((state) => ({
    search: state.search,
    visibilityFilter: state.visibilityFilter,
    sortOrder: state.sortOrder,
    setEditDish: state.setEditDish,
    dishStep: state.dishStep,
    setDishStep: state.setDishStep,
    setEditOpenMenu: state.setEditOpenMenu,
    setEditDishFunction: state.setEditDishFunction,
  }));

  const { dishes } = useDishesStore((s) => ({
    dishes: s.dishes,
  }));

  const { isLoading } = useDishes();
  const { data: linkedCategories } = useLinkedDishes();

  const allDishes = useMemo(() => {
    const linkedDishes =
      linkedCategories?.flatMap((category) => category.dishIds) || [];
    return [...dishes, ...linkedDishes];
  }, [dishes, linkedCategories]);

  const fuse = new Fuse(allDishes, {
    keys: ["name", "description"],
    threshold: 0.3,
  });

  const filteredDishes = useMemo(() => {
    let filtered = allDishes.slice() || [];
    if (search) {
      filtered = fuse.search(search).map((result) => result.item);
    }
    if (visibilityFilter !== "all") {
      filtered = filtered.filter(
        (c) => c?.visibility === (visibilityFilter === "visible"),
      );
    }
    if (filtered.length === 0) return [];
    switch (sortOrder) {
      case "asc":
        return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
      case "desc":
        return filtered.slice().sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [search, allDishes, fuse, visibilityFilter, sortOrder]);

  const filteredLinkedCategories = useMemo(() => {
    return linkedCategories
      ?.map((category) => ({
        ...category,
        dishIds: category.dishIds.filter((dish) =>
          filteredDishes.some((filteredDish) => filteredDish._id === dish._id),
        ),
      }))
      .filter((category) => category.dishIds.length > 0);
  }, [linkedCategories, filteredDishes]);

  const { unlinkedDishes } = useMemo(() => {
    const unlinked = filteredDishes.filter(
      (dish) => !dish?.categoryIds || dish?.categoryIds.length === 0,
    );
    return { unlinkedDishes: unlinked };
  }, [filteredDishes]);

  const handleEditDish = useCallback(
    (dish: DishType) => {
      setEditDish(dish);
      setDishStep("DISH_STEP_1");
      setEditOpenMenu(true);
      setEditDishFunction(dish);
    },
    [setEditDish, setDishStep, setEditOpenMenu, setEditDishFunction],
  );

  const redirectionDish = useCallback(() => {
    setShowPopUp(!showPopUp);
  }, [showPopUp]);

  const toggleCategory = useCallback(
    (categoryId: string) => {
      setOpenCategoryIds((prev) => ({
        ...prev,
        [categoryId]: !prev[categoryId],
      }));
    },
    [],
  );

  const handleDishClick = (dishId: string) => {
    setShowPopUp(false);
    document.documentElement.style.scrollBehavior = "smooth";
    const dishElement = document.getElementById(dishId);
    if (dishElement) {
      dishElement.style.scrollMarginTop = "200px";
      dishElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = "auto";
    }, 3000);
  };

  if (isLoading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <section className="relative">
      <section className="flex flex-wrap justify-start mt-[7rem] gap-4 mx-4 lg:mt-[5rem]">
        {unlinkedDishes && unlinkedDishes.length > 0 && (
          <>
            <h2 className="w-full text-lg font-semibold opacity-50">
              Unlinked Dishes
            </h2>
            <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {unlinkedDishes.map((dish) => (
                <DishButton
                  key={dish._id?.toString()}
                  dish={dish}
                  onEdit={handleEditDish}
                />
              ))}
            </div>
          </>
        )}
      </section>
      <section className="pb-[5rem] mx-4 flex flex-wrap justify-start gap-4">
        {filteredLinkedCategories &&
          filteredLinkedCategories?.length > 0 &&
          filteredLinkedCategories?.map(
            (category) =>
              category.dishIds.length > 0 && (
                <div key={category._id?.toString()} className="w-full">
                  <h2 className="my-4 text-lg font-semibold opacity-50">
                    {category.name}
                  </h2>
                  <article className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 ">
                    {category.dishIds.map((dish: DishType) => (
                      <DishButton
                        key={dish._id?.toString()}
                        dish={dish}
                        onEdit={handleEditDish}
                      />
                    ))}
                  </article>
                </div>
              ),
          )}
      </section>
      <MiddlePopUp show={showPopUp} onClose={() => setShowPopUp(!showPopUp)}>
        <section className="pt-4">
          <h1 className="ml-6 text-base font-semibold">Categories</h1>
          <section className="h-[60dvh] overflow-y-auto flex flex-wrap justify-center">
            {filteredLinkedCategories && filteredLinkedCategories?.length > 0
              ? filteredLinkedCategories?.map((category) => (
                <div
                  key={category?._id}
                  className="relative flex flex-col w-[90%] p-2 rounded-lg md:max-w-[14rem] lg:max-w-[14rem]"
                >
                  <label
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleCategory(category._id)}
                  >
                    <h3 className="text-sm">{category?.name} </h3>
                    {openCategoryIds[category._id] ? (
                      <>
                        <span className="text-xs">
                          {category?.dishIds?.length}
                        </span>
                        <IoMdArrowDropup className="text-gray-500" />
                      </>
                    ) : (
                      <>
                        <span className="text-xs">
                          {category?.dishIds?.length}
                        </span>
                        <IoMdArrowDropdown className="ml-4 text-gray-500" />
                      </>
                    )}
                  </label>
                  {openCategoryIds[category._id] &&
                    category?.dishIds.map((dish) => (
                      <a
                        key={dish._id.toString()}
                        href={`#${dish._id}`}
                        onClick={() => handleDishClick(dish._id.toString())}
                        className="mt-2 ml-2"
                      >
                        <p className="text-sm font-medium">{dish?.name}</p>
                      </a>
                    ))}
                </div>
              ))
              : null}
          </section>
        </section>
      </MiddlePopUp>
      <footer className="fixed bottom-4 flex lg:justify-center lg:-left-6 w-[92%] lg:w-[96%] gap-4 mx-4">
        <button
          onClick={redirectionDish}
          type="button"
          className="w-full py-3 text-white bg-black rounded-full lg:w-1/2"
        >
          Main Category
        </button>
      </footer>
    </section>
  );
};

const DishesManager = memo(MemoDishesManager);
export default DishesManager;
