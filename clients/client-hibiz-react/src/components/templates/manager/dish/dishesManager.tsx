import { memo, useCallback, useMemo, useState } from "react";
import Fuse from "fuse.js";
import useMenuPageStore from "@/components/store/useMenuStorage";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import type { DishType } from "@hi/db-models/src/validators";
import DishButton from "./dishesManagerCard";
import MiddlePopUp from "@/components/atom/middlePopUp";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { useDishes, useLinkedDishes } from "@/hooks/useDish";
import { useDishesStore } from "@/components/store/useDishesStore";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton.tsx";
import { HiArrowNarrowRight } from "react-icons/hi";
import { cn } from "@/lib/utils.ts";

const MemoDishesManager = () => {
  const [showPopUp, setShowPopUp] = useState(false);
  const [openCategoryIds, setOpenCategoryIds] = useState({});
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

  const { isLoading } = useDishes();
  const { data: linkedCategories } = useLinkedDishes();

  const { dishes } = useDishesStore((s) => ({
    dishes: s.dishes,
  }));

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

  const toggleCategory = useCallback((categoryId: string) => {
    setOpenCategoryIds((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

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
    return <LoadingSpinner />;
  }


  return (
    <section className="relative">
      <section className="flex flex-wrap justify-start mt-[1rem] gap-4 mx-4 lg:mt-[1rem]">
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
      <MiddlePopUp show={showPopUp} onClose={() => setShowPopUp(false)}>
        <section className="pt-4">
          <h1 className="ml-6 text-base font-semibold sr-only">Categories</h1>{" "}
          {/* Added sr-only as title is in DialogHeader */}
          <section className="h-[60dvh] overflow-y-auto flex flex-col items-center gap-2 p-4">
            {" "}
            {/* Changed flex-wrap justify-center to flex-col items-center gap-2 p-4 */}
            {filteredLinkedCategories &&
            filteredLinkedCategories?.length > 0 ? (
              filteredLinkedCategories?.map((category) => (
                <div
                  key={category?._id}
                  className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-sm" // Enhanced styling
                >
                  <label
                    className="flex items-center justify-between cursor-pointer p-4 hover:bg-accent hover:text-accent-foreground rounded-t-lg transition-colors" // Enhanced styling
                    onClick={() => toggleCategory(category._id)}
                  >
                    <h3 className="text-base font-medium">{category?.name} </h3>{" "}
                    {/* Adjusted font size */}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {" "}
                      {/* Grouped count and icon */}
                      <span className="text-sm">
                        {category?.dishIds?.length}
                      </span>{" "}
                      {/* Adjusted font size */}
                      {openCategoryIds[category._id] ? (
                        <IoMdArrowDropup className="h-5 w-5" />
                      ) : (
                        <IoMdArrowDropdown className="h-5 w-5" />
                      )}
                    </div>
                  </label>
                  {openCategoryIds[category._id] && (
                    <div className="border-t p-2">
                      {" "}
                      {/* Added border-t for separation */}
                      {category?.dishIds.map((dish) => (
                        <a
                          key={dish._id.toString()}
                          href={`#${dish._id}`}
                          onClick={() => handleDishClick(dish._id.toString())}
                          className={cn(
                            "block rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors", // Enhanced styling
                            window.location.hash === `#${dish._id}` &&
                              "bg-muted text-foreground", // Highlight active dish
                          )}
                        >
                          <p className="font-medium">{dish?.name}</p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No categories found.
              </p>
            )}{" "}
            {/* Added message for no categories */}
          </section>
        </section>
      </MiddlePopUp>
      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "Main Category",
            icon: <HiArrowNarrowRight className="mr-2 h-4 w-4" />,
            onClick: redirectionDish,
            className: "w-full",
          },
        ]}
      />
    </section>
  );
};

const DishesManager = memo(MemoDishesManager);
export default DishesManager;
