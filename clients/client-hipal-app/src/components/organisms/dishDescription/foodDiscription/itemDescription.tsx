"use client";
import { memo, useMemo } from "react";
import Image from "next/image";
import ReadMore from "@/components/atoms/readMore";
import { getPrice } from "@/components/utils/helpers";
import type { DishType } from "@hi/db-models/src/validators";
import { useActiveClass } from "@/components/store/useActiveClass";
import { useDishesStore } from "@/components/store/useDishesStore";
import type { IDish } from "@/components/types/businessData";
import { isEmpty } from "lodash-es";
import { MdMenuBook } from "react-icons/md";

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
    <div className="no-scrollbar pb-[5rem] text-[#000000]">
      {dishData?.tags && dishData?.tags?.length > 0 && (
        <section className="flex items-center gap-2 mt-2">
          {dishData?.tags?.map((ele, index) => (
            <div key={ele} className="text-sm font-semibold text-[#000000]">
              {ele}
              {index < dishData?.tags?.length - 1 && ","}
            </div>
          ))}
        </section>
      )}
      {Number(dishData?.price) > 1 && (
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
        <div className="mt-2 text-xs leading-3 text-[#000000]">
          <ReadMore text={dishData?.description || ""} />
        </div>
      )}

      {!isEmpty(dishData?.portions) && (
        <div className="flex flex-col mt-1 space-y-5">
          <div className="flex flex-row gap-4 text-base text-[#000000]">
            <MdMenuBook className="my-auto" />
            <h4 className="my-auto">
              {dishData?.portions?.length} Variants available
            </h4>
          </div>

          <div className="flex flex-row flex-wrap w-full gap-px divide-base-content bg-[#ffffff]">
            {dishData?.portions?.map((portion, key) => (
              <div
                key={key}
                className={
                  "flex flex-col min-w-[22%] max-w-full mx-auto space-y-1 text-base text-center bg-[#ffffff] flex-grow p-2"
                }
              >
                <span className="text-sm font-normal text-[#000000]">
                  {portion?.name}
                </span>
                {Number(portion?.price) > 1 && (
                  <span className="text-xs font-thin text-[#000000]">
                  ₹ {getPrice(portion?.price)}
                  </span>
                )}
              </div>
            ))}
          </div>
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
                <div className="px-2 text-sm text-[#000000]">
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
