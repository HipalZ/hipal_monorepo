import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton";
import { getPrice } from "@/components/utils/helpers";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import { memo, useCallback, useMemo, useState } from "react";
import { AiOutlineRight, AiOutlineWarning } from "react-icons/ai";
import FoodType from "../foodType";
import DishData from "../dishDescription";
import DishPopup from "../dishPopup";
import NotAvailable from "../notAvailable";
import PlaceholderImg from "../placeholder";
import type { DishType } from "@hi/db-models/src/validators";
import MemoRecommendedDishes from "@/components/organisms/dishDescription/recommendedDishes";
import { useCartStore } from "@/components/store/useCartStore";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

const MemoHorizontalCard = ({
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
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const openModal = useCallback(
    (dishData: DishType) => {
      setSelectedDish(dishData);
      setIsModalOpen(true);
    },
    [isModalOpen],
  );

  const price = useMemo(
    () => getPrice(dishData?.price || 0),
    [dishData?.price],
  );

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
  ${dishData.availability ? "mx-3" : "opacity-80 px-4"}
`}
    >
      <div className="flex flex-row items-end py-4 prose">
        <div className="flex flex-col py-1 my-auto mr-auto space-y-1">
          <div className="flex space-x-2 ">
            {dishData?.dishTypes && outletInfo?.outLetType !== "OTHER" && (
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
          </div>

          <div className="py-1 overflow-hidden text-lg font-medium leading-6 capitalize text-primary">
            {dishData?.name || ""}
          </div>
          <div className="mt-1 text-sm">
            <span className="text-base-content">
              <span className="text-sm">₹</span> {price}
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
                  className={`object-cover on_active_bounce overflow-hidden rounded-2xl m-0 ${
                    dishData.availability ? "" : "grayscale"
                  }`}
                  placeholder="blur"
                  blurDataURL={getRandomBlurImg(300, 110)}
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
              className={` flex flex-col items-center w-full mx-auto ${
                dishData?.images?.length > 0 || noDescription
                  ? " -mt-6"
                  : " -mt-4 -ml-6"
              }`}
            >
              {dishData.availability && (
                <div
                  className={`flex flex-col items-center w-full ${
                    dishData?.images?.length > 0 ? "" : "-ml-6"
                  }`}
                >
                  <DishQuantityButton dishData={dishData} />
                  <span className="text-sm opacity-50 text-base-content">
                    {dishData?.addOnIds?.length > 0 ? "customizable" : null}
                  </span>
                </div>
              )}
            </div>
          )}
          {isModalOpen && (
            <DishData show={isModalOpen} onClose={closeModal}>
              <div className="relative">
                <DishPopup dishData={selectedDish} />
              </div>
            </DishData>
          )}
        </div>
      </div>
      <div>
        {isDishInCart && (
          <div>
            <MemoRecommendedDishes
              recommendations={recommendations}
              openModal={openModal}
            />
          </div>
        )}
      </div>
    </section>
  );
};

const HorizontalCard = memo(MemoHorizontalCard);
export default HorizontalCard;
