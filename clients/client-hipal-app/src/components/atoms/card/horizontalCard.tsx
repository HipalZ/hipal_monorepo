import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton";
import {  getPrice } from "@/components/utils/helpers";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import { memo, useCallback, useState } from "react";
import { AiOutlineRight, AiOutlineWarning } from "react-icons/ai";
import FoodType from "../foodType";
import DishData from "../dishDescription";
import DishPopup from "../dishPopup";
import NotAvailable from "../notAvailable";
import PlaceholderImg from "../placeholder";
import type { DishType } from "@hi/db-models/src/validators";
import MemoRecommendedDishes from "@/components/organisms/dishDescription/recommendedDishes";
import { useCartStore } from "@/components/store/useCartStore";

const HorizontalCard = ({
  dishData,
  noAddBtn,
  noDescription,
}: {
  dishData: DishType;
  noAddBtn?: boolean;
  noDescription?: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState({} as DishType);
  const { cart } = useCartStore();
  const openModal = useCallback((dishData: DishType) => {
    console.log("dishData", dishData);
    setSelectedDish(dishData);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedDish({} as DishType);
    setIsModalOpen(false);
  }, [isModalOpen]);

  const isDishInCart = cart.some((item) => item.dish._id === dishData._id);
  const recommendations = isDishInCart ? dishData.recommendationIds : [];



  return (
    <section
      id={`${dishData?._id}`}
      className={`
  ${dishData.availability ? "mx-6" : "opacity-80 px-6"}
`}
    >
      <div className="flex flex-row items-center py-4 space-x-12 prose">
        <div className="flex flex-col py-1 my-auto mr-auto space-y-1">
          <div className="flex space-x-2 ">
            {dishData?.dishTypes && (
              <div className="my-auto">
                <FoodType types={dishData?.dishTypes} />
              </div>
            )}
            {!dishData.availability && (
              <>
                <span>
                  <AiOutlineWarning className="ml-2 -mr-1 mt-[0.125rem] text-primary" />
                </span>
                <span className="ml-2 text-sm text-primary">Not available</span>
              </>
            )}
            {/* <DishTag tags={dishData.tags} /> */}
          </div>

          <div className="overflow-hidden text-lg font-medium capitalize w-[95%]">
            {dishData?.name || ""}
          </div>
          <div className="mt-1 ml-1 text-xs ">
            <span className="text-base-content/80">
              {getPrice(dishData?.price || 0)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => openModal(dishData)}
            className="flex mt-2 space-x-1 text-primary"
          >
            <div className="underline on_active_bounce !text-sm">Know more</div>
            <div>
              <AiOutlineRight
                size={17}
                className="py-[0.125rem] mt-0.5 text-xl"
              />
            </div>
          </button>
        </div>
        <div className={"flex flex-col"}>
          <div>
            {dishData?.images[0] ? (
              <div
                className="relative w-[7.5rem] h-[7.5rem] overflow-hidden"
                onClick={() => openModal(dishData)}
              >
                <Image
                  src={dishData.images[0]}
                  layout={"intrinsic"}
                  alt="dish"
                  quality={95}
                  width={125}
                  height={125}
                  objectFit="cover"
                  className={`on_active_bounce overflow-hidden rounded-2xl m-0 ${dishData.availability ? "" : "grayscale"
                    }`}
                  placeholder="blur"
                  blurDataURL={getRandomBlurImg(110, 110)}
                />
                {!dishData.availability && (
                  <>
                    <div className="absolute z-20 text-sm text-white bottom-4 left-2">
                      Not Available
                    </div>
                    <div className="absolute w-full bottom-2 rounded-b-2xl bg-gradient-to-t from-black via-black/70 to-transparent h-1/2" />
                  </>
                )}
              </div>
            ) : !dishData.availability ? (
              <div className="pb-2">
                <NotAvailable className="w-32 h-32 overflow-hidden rounded-xl" />
              </div>
            ) : noDescription ? (
              <div>
                <PlaceholderImg className="w-32 h-32 overflow-hidden rounded-xl" />
              </div>
            ) : (
              <div className="mt-6" />
            )}
          </div>
          {!noAddBtn && (
            <div
              className={`z-20 flex flex-col items-center w-full mx-auto ${dishData?.images?.length >0 || noDescription ? " -mt-6" : " -mt-4 -ml-6"
                }`}
            >
              {dishData.availability && (
                <div
                  className={`flex flex-col items-center w-full ${dishData?.images?.length>0 ? "" : "-ml-6"
                    }`}
                >
                  <DishQuantityButton
                    dishData={dishData}
                  />
                  <span className="text-sm opacity-50">{dishData?.addOnIds?.length > 0  ? 'customizable': null}</span>
                </div>
              )}
            </div>
          )}
          {isModalOpen && dishData._id === selectedDish._id && (
            <DishData show={isModalOpen} onClose={closeModal}>
              <div className="relative py-4 mx-4 ">
                <DishPopup dishData={selectedDish} />
              </div>
            </DishData>
          )}
        </div>
      </div>
      <div>
      {isDishInCart && (
        <div>
          <MemoRecommendedDishes recommendations={recommendations} openModal={openModal} />
        </div>
      )}
      </div>
    </section>
  );
};

const MemoHorizontalCard = memo(HorizontalCard);
export default MemoHorizontalCard;
