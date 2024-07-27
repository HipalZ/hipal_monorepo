import { memo, useMemo } from "react";
import type { DishType } from "@hi/db-models/src/validators";
import placeholder from "@/assets/hisite/placeholder.png";
import addImages from "@/assets/manager/addimages.png";
import addrecommendations from "@/assets/manager/addrecommendations.png";
import description from "@/assets/manager/description.png";
import linkcat from "@/assets/manager/linkcat.png";

interface DishButtonProps {
  dish: DishType;
  onEdit: (dish: DishType) => void;
}

const getDishImages = (dish: DishType) => {
  const imagesToShow = [];

  if (dish.description?.length === 0) {
    imagesToShow.push(description);
  }

  if (dish.images?.length === 0) {
    imagesToShow.push(addImages);
  }

  if (dish.price === 0) {
    imagesToShow.push(addrecommendations);
  }

  if (dish.categoryIds?.length === 0) {
    imagesToShow.push(linkcat);
  }

  return imagesToShow;
};

const MemoDishButton = ({ dish, onEdit }: DishButtonProps) => {
  const images = useMemo(
    () => getDishImages(dish),
    [dish.description, dish.images, dish.price, dish.categoryIds],
  );

  return (
    <button
      onClick={() => onEdit(dish)}
      id={dish._id?.toString()}
      type="button"
      className="flex items-center justify-between w-full p-4 bg-white h-[4.5rem] rounded-2xl shadow max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]"
    >
      <article className="flex gap-4">
        <figure>
          {dish.images && dish.images.length > 0 ? (
            <img
              src={dish.images[0]}
              alt=""
              className="w-16 h-12 shrink-0 aspect-square rounded-xl"
            />
          ) : (
            <img
              src={placeholder}
              alt="placeholder"
              className="w-16 h-12 shrink-0 aspect-square rounded-xl"
            />
          )}
        </figure>
        <article className="flex flex-col items-start justify-center w-full">
          <h3
            title={dish?.name}
            className="text-lg font-semibold truncate mb-30"
          >
            {dish.name.length > 20 ? `${dish.name.slice(0, 20)}...` : dish.name}
          </h3>
          <div className="flex items-center gap-2">
            {images.map((imgSrc) => (
              <figure key={imgSrc}>
                <img
                  key={imgSrc}
                  src={imgSrc}
                  alt="add images"
                  className="w-4 aspect-square"
                />
              </figure>
            ))}
            {!dish.availability && <span className="text-red-500">N/A</span>}
          </div>
        </article>
      </article>
      <div className="text-gray-500">
        {dish.price ? (
          <span className="text-gray-500">₹{dish.price}</span>
        ) : null}
      </div>
    </button>
  );
};

const DishButton = memo(MemoDishButton);
export default DishButton;
