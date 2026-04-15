"use client";;
import { memo, useState, useCallback, useMemo } from "react";
import type { DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import { useCartStore } from "@/components/store/useCartStore";
import { useActiveClass } from "@/components/store/useActiveClass";
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription";
import DishPopup from "@/components/atoms/dishPopup";
import MemoRecommendedDishes from "@/components/organisms/dishDescription/recommendedDishes";
import { useCart } from "@/components/store/useCart";
import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton";
import MemoFoodType from "../foodType";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import Image from "next/image";
import useTableData from "@/components/store/useTableData";
interface HorizontalDishCardProps {
  dishData: DishType;
  primaryColor?: string;
  secondaryColor?: string;
  isEdgeLayout?: boolean;
}

const HorizontalCard = ({
  dishData,
  primaryColor = "#ec4899",
  secondaryColor = "#fce7f3",
  isEdgeLayout = false,
}: HorizontalDishCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cart } = useCartStore();
  const { setSelectedDish, isSelectedDish } = useActiveClass();
  const { setCartPage, setShowCart } = useCart();
  const outletInfo = useBusinessDetails((state) => state.businessDetails);
  const { tableName } = useTableData(); 
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

  const portions = useMemo(() => {
    return dishData?.portions?.map((portion) => ({
      name: portion.name,
      price: portion.price,
      default: portion.default,
      portionTypes: portion.portionTypes,
      _id: portion._id,
    }));
  }, [dishData]);

  // Determine if we should use a more compact layout
  const compactLayout = isEdgeLayout;

  return (
    <>
      <div
        className={cn(
          "flex relative min-h-[11.5rem] items-center justify-between border-b border-gray-100",
          compactLayout ? "p-2" : "px-4 pb-2",
        )}
      >
        <div
          className={cn(
            "flex-1 ",
            compactLayout ? "pr-2 pb-2 w-[60%]" : "pr-4 w-[70%]",
          )}
        >
          {dishData?.dishTypes && outletInfo?.outLetType !== "OTHER" && (
            <div className="my-auto mb-1">
              <MemoFoodType types={dishData?.dishTypes} />
            </div>
          )}
          <h3
            className={cn(
              "font-semibold line-clamp-2  max-h-[3.125rem] poppins-regular ",
              compactLayout
                ? "text-base leading-4"
                : "text-lg leading-[1.25rem]",
            )}
            style={{ color: primaryColor }}
          >
            {dishData.name}
          </h3>

          <p
            className="mt-1 text-base font-medium"
            style={{ color: primaryColor }}
          >
            {outletInfo?.currencySymbol}
            {portions?.length > 0
              ? portions?.[0]?.price.toFixed(2)
              : dishData?.price.toFixed(2)}
          </p>
          {dishData.description && (
            <p
              className={cn(
                "text-gray-500 line-clamp-2",
                compactLayout ? "text-xs mt-0.5" : "text-xs mt-1",
              )}
            >
              {dishData.description}
            </p>
          )}
          <button
            type="button"
            onClick={openDishDetails}
            className={cn(
              "flex items-center gap-2 text-xs underline",
              compactLayout ? "mt-1" : "mt-2",
            )}
            style={{ color: primaryColor }}
          >
            Read more
          </button>
        </div>

        <div
          className={cn(
            "relative w-[40%] flex flex-col items-center",
            compactLayout ? "w-[40%]" : "w-[30%]",
          )}
        >
          <div
            className={cn(
              "overflow-hidden rounded-md",
              compactLayout ? "w-28 h-28" : "w-32 h-32",
            )}
          >
            {dishData?.images &&
            (dishData?.images.length > 0 || dishData?.images?.[0] === "") ? (
              <Image
                src={dishData?.images?.[0]}
                alt="dish"
                quality={95}
                width={128}
                height={128}
                onClick={openDishDetails}
                className={cn(
                  "rounded-lg !object-cover !object-center",
                  compactLayout ? "w-28 h-28" : "w-32 h-32",
                  !dishData.availability && "grayscale",
                )}
              />
            ) : null}
          </div>
          <section
            className={cn(
              "absolute right-0 flex flex-col items-center justify-center w-full",
              dishData.images &&
                (dishData.images.length > 0 || dishData.images[0] === "")
                ? "-bottom-4"
                : "bottom-8",
            )}
          >
            {dishData.availability ? (
              tableName ? (
                <DishQuantityButton
                  dishData={dishData}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              ) : null
            ) : (
              <div className="px-3 py-1 mt-2 text-xs text-gray-500 bg-gray-200 rounded-md">
                Not Available
              </div>
            )}
          </section>
          {/* Modal for dish details */}
        </div>

        {/* Recommended dishes section */}
      </div>
      {isModalOpen && (
        <ItemDescriptionPopup show={isModalOpen} onClose={closeModal}>
          <DishPopup dishData={isSelectedDish} />
          {/* <CommonBottomButton
            buttons={[
              {
                text: "Go to cart",
                onClick: openCart,
                className: "shadow-md",
              },
            ]}
          /> */}
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

export default memo(HorizontalCard);
