"use client";
import { memo, useState, useCallback } from "react";
import type { DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import { useCartStore } from "@/components/store/useCartStore";
import { useActiveClass } from "@/components/store/useActiveClass";
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription";
import DishPopup from "@/components/atoms/dishPopup";
import CommonBottomButton from "@/components/atoms/bottomButton";
import MemoRecommendedDishes from "@/components/organisms/dishDescription/recommendedDishes";
import { useCart } from "@/components/store/useCart";
import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton";
import ShimmerImage from "../imageshimmer";
import MemoFoodType from "../foodType";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import foodImage from "@/assets/food.png";
interface HorizontalDishCardProps {
  dishData: DishType;
  primaryColor?: string;
  secondaryColor?: string;
}

const HorizontalTileCard = ({
  dishData,
  primaryColor = "#ec4899",
  secondaryColor = "#fce7f3",
}: HorizontalDishCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cart } = useCartStore();
  const { setSelectedDish, isSelectedDish } = useActiveClass();
  const { setCartPage, setShowCart } = useCart();
  const outletInfo = useBusinessDetails((state) => state.businessDetails);

  // Check if dish is in cart
  const cartItems = cart.filter((item) => item.dish?._id === dishData._id);
  const isDishInCart = cartItems.length > 0;
  const recommendations = isDishInCart ? dishData.recommendationIds || [] : [];

  // Open dish details modal
  const openDishDetails = useCallback(() => {
    setSelectedDish(dishData);
    setIsModalOpen(true);
  }, [dishData, setSelectedDish]);

  // Close modal
  const closeModal = useCallback(() => {
    setSelectedDish({} as DishType);
    setIsModalOpen(false);
  }, [setSelectedDish]);

  // Open cart
  const openCart = useCallback(() => {
    setSelectedDish(null);
    setCartPage("cart");
    setShowCart(true);
  }, [setShowCart, setCartPage, setSelectedDish]);

  return (
    <>
      <div
        className={cn(
          "relative flex gap-4 bg-white rounded-xl transition-all duration-200 p-2",
        )}
      >
        {/* Dish Image */}
        <div className="w-[5rem] h-[5rem] rounded-lg overflow-hidden shrink-0">
          <ShimmerImage
            src={dishData?.images?.[0] || foodImage}
            alt="dish"
            quality={95}
            width={80}
            height={80}
            onClick={openDishDetails}
            className={cn(
              "w-full h-full object-cover cursor-pointer transition-all hover:scale-105",
              !dishData.availability && "grayscale",
            )}
          />
        </div>
        <article>
          {/* Dish Name */}
          <div
            onClick={openDishDetails}
            className={cn(
              "font-semibold line-clamp-2 poppins-regular cursor-pointer text-sm leading-[1rem] flex items-center gap-1",
            )}
            style={{ color: primaryColor }}
          >
            <div className="flex items-center gap-1">
              {dishData?.dishTypes && outletInfo?.outLetType !== "OTHER" && (
                <div>
                  <MemoFoodType types={dishData?.dishTypes} />
                </div>
              )}
              <span>{dishData.name}</span>
            </div>
          </div>

          {/* Price */}
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: primaryColor }}
          >
            {outletInfo?.currencySymbol}
            {dishData.price.toFixed(2)}
          </p>
          {dishData && dishData.portions?.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5 w-32">
              {dishData?.portions.map((p) => p.name).join(" | ")}
            </p>
          )}
        </article>

        {/* Dish Action */}
        <div className="absolute right-1 bottom-1 scale-75">
          {dishData.availability ? (
            <DishQuantityButton
              dishData={dishData}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          ) : (
            <div className="px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-md">
              Not Available
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <ItemDescriptionPopup show={isModalOpen} onClose={closeModal}>
          <DishPopup dishData={isSelectedDish} />
          <CommonBottomButton
            buttons={[
              {
                text: "Go to cart",
                onClick: openCart,
                className: "shadow-md",
              },
            ]}
          />
        </ItemDescriptionPopup>
      )}
      {isDishInCart && (
        <div>
          <MemoRecommendedDishes
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            recommendations={recommendations}
            openModal={openDishDetails}
          />
        </div>
      )}
    </>
  );
};

export default memo(HorizontalTileCard);
