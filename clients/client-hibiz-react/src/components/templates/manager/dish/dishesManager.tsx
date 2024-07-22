import { memo, useCallback, useMemo, useState } from "react";
import Fuse from "fuse.js";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useDishesStore } from "@/components/store/useDishesStore";
import type { DishType } from "@hi/db-models/src/validators";
import { useDishStore, useLinkedDishes } from "@/hooks/useDishStore";
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

  const { isLoading } = useDishStore(DishSteps.LINK_RECOMMENDATION_STEP);
  const { data: linkedCategories } = useLinkedDishes();

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
    return sortOrder === "asc"
      ? filtered.sort((a, b) => a.name.localeCompare(b.name))
      : filtered.sort((a, b) => b.name.localeCompare(a.name));
  }, [search, dishes, fuse, visibilityFilter, sortOrder]);

  const { unlinkedDishes } = useMemo(() => {
    const unlinked = filteredDishes.filter(
      (dish) => !dish.categoryIds || dish.categoryIds.length === 0,
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
    [dishStep, setEditDish, setDishStep, setEditOpenMenu, setEditDishFunction],
  );

  const redirectionDish = () => {
    setShowPopUp(!showPopUp);
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryIds((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

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
      <div>
        <LoadingSpinner />
      </div>
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
            {unlinkedDishes.map((dish) => (
              <DishButton
                key={dish._id?.toString()}
                dish={dish}
                onEdit={handleEditDish}
              />
            ))}
          </>
        )}
      </section>
      <section className="pb-[5rem] mx-4 flex flex-wrap justify-start gap-4">
        {linkedCategories &&
          linkedCategories?.length > 0 &&
          linkedCategories?.map(
            (category) =>
              category.dishIds.length > 0 && (
                <div key={category._id?.toString()} className="w-full">
                  <h2 className="my-4 text-lg font-semibold opacity-50">
                    {category.name}
                  </h2>
                  <article className="flex flex-wrap justify-start gap-4">
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
            {linkedCategories && linkedCategories?.length > 0
              ? linkedCategories?.map((category) => (
                  <div
                    key={category?._id}
                    className="relative flex flex-col w-[90%] p-2 rounded-lg md:max-w-[14rem] lg:max-w-[14rem]"
                  >
                    <label
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleCategory(category._id)}
                    >
                      <h3 className="text-sm w-[80%]">{category?.name} </h3>
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
