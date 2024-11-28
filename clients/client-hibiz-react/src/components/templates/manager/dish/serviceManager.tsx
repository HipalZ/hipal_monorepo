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
import BottomButton from "@/components/atom/bottomButton";
import { motion, AnimatePresence } from "framer-motion";

const MemoServiceManagerPage = () => {
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
    let filtered = search
      ? fuse.search(search).map((result) => result.item)
      : allDishes;
    if (visibilityFilter !== "all") {
      filtered = filtered.filter(
        (c) => c?.visibility === (visibilityFilter === "visible"),
      );
    }
    return sortOrder === "asc"
      ? filtered.sort((a, b) => a?.name.localeCompare(b?.name))
      : filtered.sort((a, b) => b?.name.localeCompare(a?.name));
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
    [dishStep, setEditDish, setDishStep, setEditOpenMenu, setEditDishFunction],
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
    [openCategoryIds],
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
              Unlinked
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
      <MiddlePopUp show={showPopUp} onClose={() => setShowPopUp(false)}>
        <section className="w-full p-4">
          <h1 className="mb-6 text-2xl font-bold text-gray-800">Services</h1>
          <div className="h-[60vh] overflow-y-auto pr-2 space-y-4">
            {filteredLinkedCategories && filteredLinkedCategories.length > 0 ? (
              filteredLinkedCategories?.map((category) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-lg shadow-sm bg-gray-50"
                >
                  <button
                    type="button"
                    className="flex items-center justify-between w-full px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => toggleCategory(category?._id)}
                    aria-expanded={openCategoryIds[category?._id]}
                  >
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {category.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({category.dishIds.length})
                      </span>
                    </div>
                    {openCategoryIds[category?._id] ? (
                      <IoMdArrowDropup className="text-xl text-gray-500" />
                    ) : (
                      <IoMdArrowDropdown className="text-xl text-gray-500" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openCategoryIds[category?._id] && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-2 space-y-2">
                          {category.dishIds.map((dish) => (
                            <a
                              key={dish._id.toString()}
                              href={`#${dish._id}`}
                              onClick={() =>
                                handleDishClick(dish._id.toString())
                              }
                              className="block px-3 py-2 text-sm text-gray-700 transition duration-150 ease-in-out rounded hover:bg-blue-50"
                            >
                              {dish?.name}
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500">Not found.</p>
            )}
          </div>
        </section>
      </MiddlePopUp>
      <BottomButton
        fixed
        buttons={[
          {
            text: "Catalogue",
            onClick: redirectionDish,
          },
        ]}
      />
    </section>
  );
};

const ServiceManagerPage = memo(MemoServiceManagerPage);
export default ServiceManagerPage;
