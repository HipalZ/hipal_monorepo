import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton";
import { getPrice } from "@/components/utils/helpers";
import { memo, useCallback, useMemo, useState } from "react";
import { AiOutlineWarning } from "react-icons/ai";
import FoodType from "../foodType";
import DishPopup from "../dishPopup";
import NotAvailable from "../notAvailable";
import PlaceholderImg from "../placeholder";
import type { DishType } from "@hi/db-models/src/validators";
import MemoRecommendedDishes from "@/components/organisms/dishDescription/recommendedDishes";
import { useCartStore } from "@/components/store/useCartStore";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import ShimmerImage from "../imageshimmer";
import ItemDescriptionPopup from "../dishDescription/itemDescription";
import { useActiveClass } from "@/components/store/useActiveClass";
import CommonBottomButton from "../bottomButton";
import { useCart } from "@/components/store/useCart";
import MemoReadMore from "../readMore";

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
  const { isSelectedDish, setSelectedDish } = useActiveClass();
  const { cart } = useCartStore();
  const { showCart, setShowCart } = useCart();
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
      <div className="flex flex-row items-center pb-1 prose min-h-[9.5rem]">
        <div className="flex flex-col py-1 mr-auto space-y-1">
          <div className="flex space-x-2 ">
            {dishData?.dishTypes && outletInfo?.outLetType !== "OTHER" && (
              <div className="my-auto">
                <FoodType types={dishData?.dishTypes} />
              </div>
            )}
            {!dishData.availability && (
              <>
                <span>
                  <AiOutlineWarning className="ml-2 -mr-1 mt-[0.125rem] text-[#000000]" />
                </span>
                <span className="ml-2 text-sm text-[#000000]">
                  Not available
                </span>
              </>
            )}
          </div>

          <div className="py-1 overflow-hidden text-base font-semibold leading-5 capitalize text-[#000000]">
            {dishData?.name || ""}
          </div>
          {dishData?.description && (
            <div className="-ml-3 text-xs leading-3 scale-90">
              <MemoReadMore text={dishData?.description || ""} />
            </div>
          )}
          <button
            type="button"
            onClick={() => openModal(dishData)}
            className="flex items-center gap-4 mt-2 space-x-1 text-[#000000]"
          >
            <div className="underline !underline-offset-4 on_active_bounce !text-sm">
              Read more
            </div>
            {Number(price) > 1 && (
              <div className="text-sm font-semibold opacity-70">₹ {price}</div>
            )}
          </button>
        </div>
        <div className={"flex flex-col pt-2"}>
          <div>
            {dishData?.images?.[0] ? (
              <div
                className="relative w-[6rem] h-[6rem] overflow-hidden "
                onClick={() => openModal(dishData)}
              >
                <ShimmerImage
                  src={dishData.images[0]}
                  alt="dish"
                  quality={95}
                  width={96}
                  height={96}
                  className={`object-cover on_active_bounce overflow-hidden rounded-2xl m-0 ${
                    dishData.availability ? "" : "grayscale"
                  }`}
                />
                {!dishData.availability && (
                  <>
                    <div className="absolute bottom-0 z-20 text-sm text-white left-2">
                      Not Available
                    </div>
                    <div className="absolute bottom-0 w-full h-1/2 rounded-b-2xl bg-gradient-to-t from-black via-black/70 to-transparent" />
                  </>
                )}
              </div>
            ) : !dishData.availability ? (
              <div className="pb-2">
                <NotAvailable className="!w-[6rem] !h-[6rem] overflow-hidden rounded-xl" />
              </div>
            ) : noDescription ? (
              <div>
                <PlaceholderImg className="w-[6rem] h-[6rem] overflow-hidden rounded-xl" />
              </div>
            ) : (
              <div className="mt-6" />
            )}
          </div>
          {!noAddBtn && (
            <div
              className={` flex flex-col items-center w-full mx-auto scale-[0.85] ${
                (dishData?.images?.length > 0 || noDescription) && "-mt-4"
              }`}
            >
              {dishData.availability && (
                <div
                  className={`flex flex-col items-center w-full ${
                    dishData?.images?.length > 0 ? "" : "ml-2"
                  }`}
                >
                  <DishQuantityButton dishData={dishData} />
                  <span className="text-sm opacity-50 text-[#000000]">
                    {(dishData?.addOnIds?.length ||
                      dishData?.portions?.length) > 0
                      ? "customizable"
                      : null}
                  </span>
                </div>
              )}
            </div>
          )}
          {isModalOpen && (
            <ItemDescriptionPopup show={isModalOpen} onClose={closeModal}>
              <DishPopup dishData={isSelectedDish} />
              <CommonBottomButton
                buttons={[
                  {
                    text: "Go to cart",
                    onClick: () => setShowCart(!showCart),
                    highlight: true,
                  },
                ]}
              />
            </ItemDescriptionPopup>
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
