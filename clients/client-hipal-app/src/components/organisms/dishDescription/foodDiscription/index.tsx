import React, { memo, useMemo } from "react";
import FoodType from "@/components/atoms/foodType";
import ReadMore from "@/components/atoms/readMore";
import { getPrice } from "@/components/utils/helpers";
import { isEmpty } from "lodash-es";
import { MdOutlineRiceBowl } from "react-icons/md";
import DishQuantityButton from "../dishQuantityButton";
import { BsFillCircleFill } from "react-icons/bs";
import { IoFastFoodSharp } from "react-icons/io5";
import type { DishType } from "@hi/db-models/src/validators";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import PrepDeliveryTimeBadge from "@/components/atoms/prepDeliveryTimeBadge";

function FoodDescription({ dishData }: { dishData: DishType }) {
  const isAvailable = dishData?.availability;
  const currencySymbol = useBusinessDetails(
    (s) => s.businessDetails?.currencySymbol,
  );
  const outLetType = useBusinessDetails((s) => s.businessDetails.outLetType);

  const price = useMemo(
    () => getPrice(dishData?.price || 0),
    [dishData?.price],
  );

  return (
    <div className="flex flex-col -mt-9 space-y-4 no-scrollbar pb-[2rem]">
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap flex-1 w-full ">
          {dishData?.dishTypes?.length > 0 && outLetType !== "OTHER" && (
            <div className="my-auto">
              <FoodType types={dishData.dishTypes} />
            </div>
          )}
          {isAvailable && (
            <div className="my-1 ml-auto shrink-0">
              <DishQuantityButton dishData={dishData} />
            </div>
          )}
          <div
            className={`w-full font-medium mt-1 poppins-regular 
        ${dishData?.name?.length > 30 ? "text-lg" : "text-xl"}
        ${isAvailable ? "mt-4" : "mt-6"}`}
          >
            {dishData?.name || ""}
          </div>
          <div className="my-2">
            {Number(price) > 1 && (
              <span className="text-base">
                {currencySymbol} {Number(price).toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <div className="w-full mt-1">
            <PrepDeliveryTimeBadge minutes={dishData?.avgPrepTime} />
          </div>
        </div>
        {dishData?.description && (
          <div className="text-xs leading-3">
            <ReadMore text={dishData?.description || ""} />
          </div>
        )}
      </div>

      {!isEmpty(dishData?.portions) && (
        <div className="flex flex-col mt-1 space-y-5">
          <div className="flex flex-row gap-4 text-base text-[#000000]">
            <MdOutlineRiceBowl className="my-auto" />
            <h4 className="my-auto poppins-regular">
              {dishData?.portions?.length} Portions available
            </h4>
          </div>

          <div className="flex flex-row flex-wrap w-full gap-px divide-base-content bg-base-content/10">
            {dishData?.portions?.map((portion, key) => (
              <div
                key={key}
                className={
                  "flex flex-col min-w-[22%] max-w-full mx-auto space-y-1 text-base text-center bg-[#ffffff] flex-grow p-2"
                }
              >
                <span className="text-sm font-normal text-base-content poppins-regular">
                  {portion?.name}
                </span>
                <span className="text-xs font-thin text-base-content ">
                  {currencySymbol} {getPrice(portion?.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isEmpty(dishData?.addOnIds) && (
        <div className="flex flex-col pt-1 space-y-5">
          <div className="flex flex-row gap-4 text-base !text-[#000000]">
            <IoFastFoodSharp className="my-auto text-xl" />
            <h4 className="my-auto">Extras available</h4>
          </div>

          {dishData?.addOnIds?.map((addOn, key) => (
            <div key={addOn._id.toString()} className="space-y-3">
              <h6 className="text-sm poppins-regular">
                {key + 1}. {addOn?.name}
              </h6>

              <ul className="grid justify-start grid-cols-2 px-1 py-2 border rounded-lg flex-col-2 border-base-content/20">
                {addOn?.choices.map((choice) => (
                  <li
                    key={choice._id}
                    className="flex flex-row gap-2 py-2 text-sm font-normal opacity-60 min-w-fit text-[#000000]"
                  >
                    <BsFillCircleFill className="inline-flex p-1 my-auto text-xs" />
                    <span className="my-auto text-sm text-start poppins-regular">
                      {choice?.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MemoFoodDescription = memo(FoodDescription);
export default MemoFoodDescription;
