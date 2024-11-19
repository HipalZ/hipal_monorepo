"use client";
import { memo, useMemo } from "react";
import Image from "next/image";
import ReadMore from "@/components/atoms/readMore";
import { getPrice } from "@/components/utils/helpers";
import type { DishType } from "@hi/db-models/src/validators";
import { useActiveClass } from "@/components/store/useActiveClass";
import { useDishesStore } from "@/components/store/useDishesStore";
import type { IDish } from "@/components/types/businessData";

function MemoIndividualItemDescription() {
  const { isSelectedDish: dishData, setSelectedDish } = useActiveClass();
  const isAvailable = dishData?.availability;

  const dishes = useDishesStore((s) => s.dishes);

  const processedDishes = useMemo(() => {
    return dishData?.recommendationIds
      ?.map((dishId) => dishes?.find((dish: IDish) => dish._id === dishId))
      .filter(Boolean);
  }, [dishData?.recommendationIds, dishes]);

  return (
    <div className="no-scrollbar pb-[5rem]">
      {dishData?.tags && dishData?.tags?.length > 0 && (
        <section className="flex items-center gap-2 mt-2">
          {dishData?.tags.map((ele, index) => (
            <div key={ele} className="text-sm font-semibold text-primary">
              {ele}
              {index < dishData.tags.length - 1 && ","}
            </div>
          ))}
        </section>
      )}
      {Number(dishData?.price) > 0 && (
        <b className="text-base opacity-60">
          ₹ {Number(dishData?.price).toLocaleString("en-IN")}
        </b>
      )}
      <div
        className={`w-full font-medium 
        ${dishData?.name?.length > 30 ? "text-lg" : "text-xl"}
        ${isAvailable ? "mt-2" : "mt-2"}`}
      >
        {dishData?.name || ""}
      </div>

      {dishData?.description && (
        <div className="mt-2 text-xs leading-3 text-base-content">
          <ReadMore text={dishData?.description || ""} />
        </div>
      )}

      {processedDishes && processedDishes?.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">Recommended Items</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {processedDishes.map((recommendation: DishType) => (
              <div
                key={recommendation?._id || ""}
                className="pb-2 border rounded-lg shadow-sm"
                onClick={() => setSelectedDish(recommendation)}
              >
                <Image
                  src={recommendation?.images?.[0]}
                  alt={recommendation?.name}
                  width={160}
                  height={160}
                  className="object-cover w-full h-32 rounded-t-md"
                />
                <div className="px-2 mt-2 text-sm font-medium">
                  {recommendation?.name}
                </div>
                <div className="px-2 text-sm text-base-content">
                  ₹{" "}
                  {Number(getPrice(recommendation?.price || 0)).toLocaleString(
                    "en-IN",
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const IndividualItemDescription = memo(MemoIndividualItemDescription);
export default IndividualItemDescription;
