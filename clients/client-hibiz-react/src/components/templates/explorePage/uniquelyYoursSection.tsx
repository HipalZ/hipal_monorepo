import { memo } from "react";
import dummyImage from "@/assets/hisite/placeholder.png";
import SubHeader from "@/components/atom/subHeader";
import Paragraph from "@/components/atom/paragraph";
import PlusButton from "@/components/atom/plusButton";
import type { IDish } from "@/components/types/businessData";
import { useExploreStore } from "@/components/store/useExploreStore";

interface IUniqueSection {
  handleOpenPopUp: () => void;
}

const MemoUniquelyYoursSection = (props: IUniqueSection) => {
  const uniquelyDishes = useExploreStore((s) => s.uniquelyDishes);
  const { handleOpenPopUp } = props;
  return (
    <section className="mb-4">
      <SubHeader text="Uniquely Yours" />
      <Paragraph text="select your best dishes on explore page" />
      <article className="flex flex-wrap gap-2 p-4 mt-2 bg-white rounded-2xl">
        {uniquelyDishes.length > 0 &&
          uniquelyDishes.map((dish: IDish, index: number) => {
            return (
              <article
                onClick={handleOpenPopUp}
                onKeyDown={handleOpenPopUp}
                key={dish._id}
                className="shrink-0 relative rounded-xl h-[5rem] w-[5rem] inline-block"
              >
                <label
                  htmlFor={`uniquelyYours${dish._id || index}`}
                  className="flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl"
                >
                  {dish.images[0] ? (
                    <img
                      src={dish.images[0]}
                      alt="Dish"
                      className="h-[5rem] w-[5rem]"
                    />
                  ) : (
                    <img
                      src={dummyImage}
                      alt="dish"
                      className="h-[5rem] w-[5rem]"
                    />
                  )}
                </label>
              </article>
            );
          })}
        <article
          onClick={handleOpenPopUp}
          onKeyDown={handleOpenPopUp}
          className="shrink-0 relative rounded-xl h-[5rem] w-[5rem] border-dashed border-2 inline-block border-[#8C63FF]"
        >
          <label className="flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl">
            <PlusButton />
          </label>
        </article>
      </article>
    </section>
  );
};

const UniquelyYoursSection = memo(MemoUniquelyYoursSection);
export default UniquelyYoursSection;
