"use client";
import { memo, useState, useCallback, useMemo } from "react";
import type { DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import { useCartStore } from "@/components/store/useCartStore";
import { useActiveClass } from "@/components/store/useActiveClass";
import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton";
import MemoFoodType from "../foodType";
import { ImageOff } from "lucide-react";
import ItemDescriptionPopup from "../dishDescription/itemDescription";
import MemoDishPopup from "../dishPopup";
import CommonBottomButton from "../bottomButton";
import MemoRecommendedDishes from "@/components/organisms/dishDescription/recommendedDishes";
import { useCart } from "@/components/store/useCart";
import Image from "next/image";
import foodImage from "@/assets/food.png";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import PrepDeliveryTimeBadge from "@/components/atoms/prepDeliveryTimeBadge";

interface GridDishCardProps {
  dishData: DishType;
  primaryColor?: string;
  secondaryColor?: string;
  isEdgeLayout?: boolean;
}

const GridDishCard = ({
  dishData,
  primaryColor = "#ec4899",
  secondaryColor = "#fce7f3",
  isEdgeLayout,
}: GridDishCardProps) => {
  const currencySymbol = _useAllBusiness(
    (s) => s.data.outletInfo?.currencySymbol,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cart } = useCartStore();
  const { setSelectedDish, isSelectedDish } = useActiveClass();
  const { setCartPage, setShowCart } = useCart();

  // Open dish details modal
  const openDishDetails = useCallback(() => {
    setSelectedDish(dishData);
    setIsModalOpen(true);
  }, [dishData, setSelectedDish]);

  const closeModal = useCallback(() => {
    setSelectedDish({} as DishType);
    setIsModalOpen(false);
  }, [setSelectedDish]);

  const openCart = useCallback(() => {
    setSelectedDish(null);
    setCartPage("cart");
    setShowCart(true);
  }, [setShowCart, setCartPage, setSelectedDish]);

  const cartItems = cart.filter((item) => item.dish?._id === dishData._id);
  const isDishInCart = cartItems.length > 0;
  const recommendations = isDishInCart ? dishData.recommendationIds || [] : [];

  const portions = useMemo(() => {
    return dishData?.portions?.map((portion) => ({
      name: portion.name,
      price: portion.price,
      default: portion.default,
      portionTypes: portion.portionTypes,
      _id: portion._id,
    }));
  }, [dishData]);

  return (
    <div className="flex flex-col">
      {/* Main dish card with fixed height */}
      <div
        className={cn(
          "flex flex-col min-h-[23.5rem] max-h-[26rem] pb-[3.5rem] relative items-start overflow-hidden",
        )}
      >
        {/* Image section */}
        <div
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              openDishDetails();
            }
          }}
          className="w-full cursor-pointer aspect-square overflow-hidden rounded-md"
          onClick={openDishDetails}
        >
          {dishData.images &&
          (dishData?.images.length > 0 || dishData?.images?.[0] === "") ? (
            <Image
              src={dishData?.images?.[0] || foodImage}
              alt={dishData.name}
              width={300}
              height={300}
              className={cn(
                "object-cover w-full h-full rounded-md",
                !dishData.availability && "grayscale",
              )}
            />
          ) : (
            <div
              className="flex items-center justify-center w-full h-full"
              style={{ backgroundColor: secondaryColor }}
            >
              <ImageOff color={primaryColor} size={40} />
            </div>
          )}
          {!dishData.availability && (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
              Not Available
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="flex-1 w-full px-3 pt-3">
          <div className="my-auto mb-1">
            <MemoFoodType types={dishData?.dishTypes} />
          </div>
          <h3
            className="text-lg font-semibold poppins-regular  leading-[1.25rem] text-black h-[3.75rem] line-clamp-3"
            onClick={openDishDetails}
          >
            {dishData.name}
          </h3>

          <p className="mt-2 font-semibold text-black opacity-60">
            {currencySymbol}{" "}
            {portions?.length > 0
              ? portions?.[0]?.price.toFixed(2)
              : dishData?.price.toFixed(2)}
          </p>
          <PrepDeliveryTimeBadge
            minutes={dishData?.avgPrepTime}
            className="mt-2"
            color={primaryColor}
          />

          {dishData.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-3 h-[3rem]">
              {dishData.description}
            </p>
          )}
        </div>

        {/* Add to cart button section - fixed at bottom */}
        {dishData.availability ? (
          <section className="absolute flex flex-col items-center justify-center w-full bottom-2">
            <DishQuantityButton
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              className="w-[90%]"
              dishData={dishData}
            />
            <div className="text-xs opacity-50 bg-white text-[#000000] absolute -bottom-0.5 z-10">
              {(dishData?.addOnIds?.length || dishData?.portions?.length) > 0
                ? "customizable"
                : null}
            </div>
          </section>
        ) : (
          <div className="absolute flex justify-center w-full bottom-4">
            <div className="px-3 py-1 text-xs text-center text-gray-500 bg-gray-200 rounded-md">
              Not Available
            </div>
          </div>
        )}
      </div>

      {/* Recommended dishes section - outside the main card */}
      {isDishInCart && recommendations.length > 0 && (
        <div className="mt-2">
          <MemoRecommendedDishes
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            recommendations={recommendations}
            openModal={openDishDetails}
          />
        </div>
      )}

      {/* Modal for dish details */}
      {isModalOpen && (
        <ItemDescriptionPopup show={isModalOpen} onClose={closeModal}>
          <MemoDishPopup dishData={isSelectedDish} />
          {/* <CommonBottomButton
            buttons={[
              {
                text: "Go to cart",
                onClick: openCart,
              },
            ]}
          /> */}
        </ItemDescriptionPopup>
      )}
    </div>
  );
};

export default memo(GridDishCard);
