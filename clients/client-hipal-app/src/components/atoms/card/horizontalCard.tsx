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
import { CiImageOn } from "react-icons/ci";
import PrepDeliveryTimeBadge from "@/components/atoms/prepDeliveryTimeBadge";

interface HorizontalDishCardProps {
  dishData: DishType;
  primaryColor?: string;
  secondaryColor?: string;
  isEdgeLayout?: boolean;
  noDescription?: boolean;
  redirection?: (dishId: string, category: unknown[]) => void;
}

const HorizontalCard = ({
  dishData,
  primaryColor = "#ec4899",
  secondaryColor = "#fce7f3",
  isEdgeLayout = false,
  noDescription = false,
}: HorizontalDishCardProps) => {
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
  const searchLayout = noDescription;

  const shouldShowAddButton = useMemo(() => {
    return (
      outletInfo?.addButton !== false &&
      (!!tableName || outletInfo?.outLetType === "HOTEL")
    );
  }, [outletInfo, tableName]);

  return (
    <>
      <div
        className={cn(
          "flex relative items-center justify-between border-b border-gray-100",
          searchLayout
            ? "min-h-[9rem] gap-3 rounded-2xl border border-emerald-950/5 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            : "min-h-[11.5rem]",
          compactLayout ? "p-2" : searchLayout ? "" : "px-4 pb-2",
        )}
      >
        <div
          className={cn(
            "flex-1 min-w-0",
            compactLayout
              ? "pr-2 pb-2 w-[60%]"
              : searchLayout
                ? "w-[62%] pr-1"
                : "pr-4 w-[70%]",
          )}
        >
          {dishData?.dishTypes && outletInfo?.outLetType !== "OTHER" && (
            <div className="my-auto mb-1">
              <MemoFoodType types={dishData?.dishTypes} />
            </div>
          )}
          <h3
            className={cn(
              "font-semibold line-clamp-2 poppins-regular ",
              compactLayout
                ? "text-base leading-4"
                : searchLayout
                  ? "text-[1.05rem] leading-[1.1rem]"
                  : "text-lg leading-[1.25rem] max-h-[3.125rem]",
            )}
            style={{ color: primaryColor }}
          >
            {dishData.name}
          </h3>

          <p
            className={cn(
              "mt-1 font-medium",
              searchLayout ? "text-sm" : "text-base",
            )}
            style={{ color: primaryColor }}
          >
            {outletInfo?.currencySymbol}
            {portions?.length > 0
              ? portions?.[0]?.price.toFixed(2)
              : dishData?.price.toFixed(2)}
          </p>
          <PrepDeliveryTimeBadge
            minutes={dishData?.avgPrepTime}
            className={compactLayout || searchLayout ? "mt-1" : "mt-2"}
            color={primaryColor}
          />
          {!noDescription && dishData.description && (
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
              compactLayout || searchLayout ? "mt-1" : "mt-2",
            )}
            style={{ color: primaryColor }}
          >
            Read more
          </button>
        </div>

        <div
          className={cn(
            "relative flex flex-col items-center shrink-0",
            compactLayout ? "w-[40%]" : searchLayout ? "w-[6.75rem]" : "w-[30%]",
          )}
        >
          <div
            className={cn(
              "overflow-hidden rounded-md",
              compactLayout ? "w-28 h-28" : searchLayout ? "h-24 w-24" : "w-32 h-32",
            )}
          >
            {dishData?.images?.[0] && dishData.images[0].trim() !== "" ? (
              <Image
                src={dishData.images[0]}
                alt={dishData?.name || "dish"}
                quality={95}
                width={128}
                height={128}
                onClick={openDishDetails}
                className={cn(
                  "rounded-lg !object-cover !object-center cursor-pointer",
                  compactLayout ? "w-28 h-28" : searchLayout ? "h-24 w-24" : "w-32 h-32",
                  !dishData.availability && "grayscale",
                )}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                <CiImageOn className="text-gray-300" size={compactLayout ? 26 : 30} />
              </div>
            )}
          </div>
          <section
            className={cn(
              "right-0 flex flex-col items-center justify-center w-full",
              searchLayout ? "mt-2" : "absolute -bottom-4",
            )}
          >
            {!dishData.availability ? (
              <div className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
                Not available
              </div>
            ) : shouldShowAddButton ? (
              <DishQuantityButton
                dishData={dishData}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                className={searchLayout ? "h-9 w-full" : undefined}
              />
            ) : null}
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
