import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import type { DishType } from "@hi/db-models/src/validators";
import { memo } from "react";
import addImages from "@/assets/manager/addimages.png";
import addrecommendations from "@/assets/manager/addrecommendations.png";
import description from "@/assets/manager/description.png";
import linkcat from "@/assets/manager/linkcat.png";

const MemoPendingActions = () => {
  const { editDish, setDishStep } = useMenuPageStore((s) => ({
    editDish: s.editDish,
    setDishStep: s.setDishStep,
  }));

  const actions = {
    description: {
      image: description,
      text: "Write Description",
      redirection: "writeDescription",
    },
    addImages: {
      image: addImages,
      text: "Upload Images",
      redirection: "uploadImages",
    },
    addRecommendations: {
      image: addrecommendations,
      text: "Add Recommendations",
      redirection: "addRecommendations",
    },
    linkcat: {
      image: linkcat,
      text: "Link to Categories",
      redirection: "linkCategories",
    },
  };

  const getDishActions = (dish: DishType) => {
    const actionsToShow = [];

    if (!dish.description || dish.description.length === 0) {
      actionsToShow.push(actions.description);
    }

    if (!dish.images || dish.images.length === 0) {
      actionsToShow.push(actions.addImages);
    }

    if (dish.price === 0) {
      actionsToShow.push(actions.addRecommendations);
    }

    if (!dish.categoryIds || dish.categoryIds.length === 0) {
      actionsToShow.push(actions.linkcat);
    }

    return actionsToShow;
  };

  const pendingActions = getDishActions(editDish);

  const handlRedirection = (redirection: string) => {
    switch (redirection) {
      case "writeDescription":
        setDishStep(DishSteps.DISH_STEP_2);
        break;
      case "uploadImages":
        setDishStep(DishSteps.DISH_STEP_2);
        break;
      case "addRecommendations":
        setDishStep(DishSteps.DISH_STEP_2);
        break;
      case "linkCategories":
        setDishStep(DishSteps.DISH_STEP_1);
        break;
      default:
        setDishStep(DishSteps.DISH_STEP_1);
    }
  };

  return (
    <section className="mx-6 lg:mx-16 lg:mt-6">
      {pendingActions.map((action, index) => (
        <a
          onClick={() => handlRedirection(action?.redirection)}
          href={`#${action?.redirection}`}
          key={index.toString()}
          className="flex items-center px-6 py-2 my-2 space-x-4 bg-white rounded-full"
        >
          <img src={action.image} alt={action.text} className="w-4 h-4" />
          <span className="flex-grow text-sm">{action.text}</span>
          <button type="button" className="inline-block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </a>
      ))}
    </section>
  );
};

const PendingActions = memo(MemoPendingActions);
export default PendingActions;
