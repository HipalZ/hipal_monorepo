import { lazy, memo, useCallback } from "react";
import dummyImage from "@/assets/hisite/placeholder.png";
import type { IDish } from "@/components/types/businessData";
import { useExploreStore } from "@/components/store/useExploreStore";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useUniquelyYours } from "@/hooks/useExplore";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const SubHeader = lazy(() => import("@/components/atom/subHeader"));
const Paragraph = lazy(() => import("@/components/atom/paragraph"));
const PlusButton = lazy(() => import("@/components/atom/plusButton"));

const MemoUniquelyYoursSection = () => {
  const businessId = useParams()?.businessId;
  const { fetchUniquelyYours } = useUniquelyYours();
  const { uniquelyDishes, setShowUniquePopUp } =
    useExploreStore((s) => ({
      uniquelyDishes: s.uniquelyDishes,
      setShowUniquePopUp: s.setShowUniquePopUp,
    }));

  // open popup
  const handleOpenPopUp = useCallback(() => {
    setShowUniquePopUp(true);
  }, [setShowUniquePopUp]);

  // => fetch uniquely yours
  const { isLoading: uniquelyLoading } = useQuery({
    queryKey: ["categories", businessId],
    queryFn: fetchUniquelyYours,
    enabled: !!businessId,
  });

  if (uniquelyLoading) {
    return <article className="h-96">
      <LoadingSpinner />
    </article>
  }

  return (
    <section className="mb-4">
      <SubHeader text="Uniquely Yours" />
      <Paragraph text="Showcase up to 6 of your best items on the Explore page" />
      <article className="flex flex-wrap gap-2 p-4 mt-2 bg-white rounded-2xl min-h-[7rem]">
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
                  {dish.images.length > 0 ? (
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
