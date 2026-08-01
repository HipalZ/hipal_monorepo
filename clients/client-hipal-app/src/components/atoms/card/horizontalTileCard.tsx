"use client";
import { memo, useState, useCallback, useMemo } from "react";
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
import useTableData from "@/components/store/useTableData";
import { CiImageOn } from "react-icons/ci";
import PrepDeliveryTimeBadge from "@/components/atoms/prepDeliveryTimeBadge";
interface HorizontalDishCardProps {
  dishData: DishType;
  primaryColor?: string;
  secondaryColor?: string;
  onReadMore?: () => void;
}

const HorizontalTileCard = ({
  dishData,
  primaryColor = "#ec4899",
  secondaryColor = "#fce7f3",
  onReadMore
}: HorizontalDishCardProps) => {
  if (!dishData?.availability) return null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cart } = useCartStore();
  const { setSelectedDish, isSelectedDish } = useActiveClass();
  const { setCartPage, setShowCart } = useCart();

  const outletInfo = useBusinessDetails((state) => state.businessDetails);
  const { tableName } = useTableData();
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

  const shouldShowAddButton = useMemo(() => {
    return (
      outletInfo?.addButton !== false &&
      (!!tableName || outletInfo?.outLetType === "HOTEL")
    );
  }, [outletInfo, tableName]);

  return (
    <>
      <div className="flex min-h-[3.5rem] w-full items-start justify-between gap-3 rounded-xl bg-white p-3">
        {/* Dish Content (Name, Price, Portions) */}
        <article className="flex-1">
          {/* Dish Name with Food Type */}
          <div
            onClick={openDishDetails}
            className="flex items-center gap-1 text-sm font-semibold leading-[1.1rem] poppins-regular cursor-pointer"
            style={{ color: primaryColor }}
          >
            {dishData?.dishTypes && outletInfo?.outLetType !== "OTHER" && (
              <MemoFoodType types={dishData?.dishTypes} />
            )}
            <span>{dishData.name}</span>
          </div>
          {/* Price */}
          <p
            className="text-sm font-medium mt-1"
            style={{ color: primaryColor }}
          >
            {outletInfo?.currencySymbol}
            {dishData.price.toFixed(2)}
          </p>

          {/* Portions */}
          {dishData && dishData?.portions?.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {dishData.portions
                .map(
                  (p) =>
                    `${p.name} ${outletInfo?.currencySymbol || ""}${
                      p.price?.toFixed(2) ?? ""
                    }`,
                )
                .join(" | ")}
            </p>
          )}
          <div className="mt-1.5">
            <PrepDeliveryTimeBadge
              minutes={dishData?.avgPrepTime}
              color={primaryColor}
            />
          </div>
          <button
          type="button"
          onClick={onReadMore}
          className="mt-1 block text-xs underline"
          style={{ color: primaryColor }}
        >
          Read more
        </button>
        </article>

        {/* Dish Image + ADD Button */}
        <section className="min-h-[4rem] flex flex-col items-center relative shrink-0">
          <article className="h-[4.75rem] w-[4.75rem] rounded-md overflow-hidden">
          {dishData?.images?.[0] && dishData.images[0].trim() !== "" ? (
            <ShimmerImage
              src={dishData.images[0]}
              alt={dishData?.name || "dish"}
              width={80}
              height={80}
              onClick={openDishDetails}
              className={cn(
                "cursor-pointer transition-all",
                !dishData.availability && "grayscale",
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center rounded-md border-2 border-dashed border-gray-100 bg-gray-50">
              <CiImageOn className="text-gray-300" size={24} />
            </div>
          )}
        </article>

          {/* Action Button */}
          <article
            style={{
              transform: "scale(0.70)",
            }}
            className={cn(
              "w-full text-center",
              `${
                dishData?.images[0]?.length > 0
                  ? "left-1/2 -mt-4"
                  : "top-1/2"
              }`,
            )}
          >
          {!dishData.availability ? (
            <div className="text-xs bg-gray-200 text-gray-500 rounded px-2 py-0.5">
              Not Available
            </div>
          ) : shouldShowAddButton ? (
            <DishQuantityButton
              dishData={dishData}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          ) : null}
          </article>
        </section>
      </div>

      {isModalOpen && (
        <ItemDescriptionPopup show={isModalOpen} onClose={closeModal}>
          <DishPopup dishData={isSelectedDish} />
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
