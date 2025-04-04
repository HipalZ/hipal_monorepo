"use client"
import { memo, useState, useCallback } from "react"
import type { DishType } from "@hi/db-models/src/validators"
import { cn } from "@hi/common"
import { useCartStore } from "@/components/store/useCartStore"
import { useActiveClass } from "@/components/store/useActiveClass"
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription"
import DishPopup from "@/components/atoms/dishPopup"
import CommonBottomButton from "@/components/atoms/bottomButton"
import MemoRecommendedDishes from "@/components/organisms/dishDescription/recommendedDishes"
import { useCart } from "@/components/store/useCart"
import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton"
import ShimmerImage from "../imageshimmer"
import MemoFoodType from "../foodType"
import useBusinessDetails from "@/components/store/useBusinessDetails"

interface HorizontalDishCardProps {
  dishData: DishType
  primaryColor?: string
  secondaryColor?: string
  isEdgeLayout?: boolean
}

const HorizontalCard = ({
  dishData,
  primaryColor = "#000000",
  secondaryColor = "#f5f5f5",
  isEdgeLayout = false,
}: HorizontalDishCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addToCart, cart } = useCartStore()
  const { setSelectedDish, isSelectedDish } = useActiveClass()
  const { setCartPage, setShowCart } = useCart()
  const outletInfo = useBusinessDetails((state) => state.businessDetails)

  // Check if dish is in cart
  const cartItems = cart.filter((item) => item.dish?._id === dishData._id)
  const isDishInCart = cartItems.length > 0
  const recommendations = isDishInCart ? dishData.recommendationIds || [] : []

  // Open dish details modal
  const openDishDetails = useCallback(() => {
    setSelectedDish(dishData)
    setIsModalOpen(true)
  }, [dishData, setSelectedDish])

  // Close modal
  const closeModal = useCallback(() => {
    setSelectedDish({} as DishType)
    setIsModalOpen(false)
  }, [setSelectedDish])

  // Open cart
  const openCart = useCallback(() => {
    setSelectedDish(null)
    setCartPage("cart")
    setShowCart(true)
  }, [setShowCart, setCartPage, setSelectedDish])

  // Determine if we should use a more compact layout
  const compactLayout = isEdgeLayout

  return (
    <div className={cn("flex relative items-center justify-between border-b border-gray-100", compactLayout ? "p-2" : "p-4")}>
      <div className={cn("flex-1 w-[60%]", compactLayout ? "pr-2" : "pr-4")}>
        {dishData?.dishTypes && outletInfo?.outLetType !== "OTHER" && (
          <div className="my-auto">
            <MemoFoodType types={dishData?.dishTypes} />
          </div>
        )}
        <h3
          className={cn("font-semibold truncate", compactLayout ? "text-sm" : "text-base")}
          style={{ color: primaryColor }}
        >
          {dishData.name}
        </h3>

        <p className="text-sm font-medium" style={{ color: primaryColor }}>
          ₹{dishData.price.toFixed(2)}
        </p>
        {dishData.description && (
          <p className={cn("text-gray-500 line-clamp-2", compactLayout ? "text-xs mt-0.5" : "text-xs mt-1")}>
            {dishData.description}
          </p>
        )}
        <button
          type="button"
          onClick={openDishDetails}
          className={cn("flex items-center gap-2 text-xs underline", compactLayout ? "mt-1" : "mt-2")}
          style={{ color: primaryColor }}
        >
          Read more
        </button>
      </div>

      <div className="relative flex flex-col items-center">
        <div className={cn("overflow-hidden rounded-md", compactLayout ? "w-16 h-16" : "w-32 h-32")}>
          {dishData.images && dishData.images.length > 0 ? (
            <ShimmerImage
              src={dishData?.images?.[0]}
              alt="dish"
              quality={95}
              width={128}
              height={128}
              className={cn("object-cover w-full h-full rounded-lg", !dishData.availability && "grayscale")}
            />
          ) : (
            <div
              className="flex items-center justify-center w-full h-full"
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "0.5rem",
                border: `2px solid ${secondaryColor}`,
              }}
              onClick={openDishDetails}
            >
              <span className="text-xl" style={{ color: primaryColor }}>
                {dishData.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <section className="absolute right-0 flex flex-col items-center justify-center w-full -bottom-4">
          {dishData.availability ? (
            <DishQuantityButton
              dishData={dishData}
              className={compactLayout ? "mt-1 scale-90" : "mt-2"}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          ) : (
            <div className="px-3 py-1 mt-2 text-xs text-gray-500 bg-gray-200 rounded-md">Not Available</div>
          )}

        </section>
        {/* Modal for dish details */}
      </div>
      {isModalOpen && (
        <ItemDescriptionPopup show={isModalOpen} onClose={closeModal}>
          <DishPopup dishData={isSelectedDish} />
          <CommonBottomButton
            buttons={[
              {
                text: "Go to cart",
                onClick: openCart,
                highlight: true,
              },
            ]}
          />
        </ItemDescriptionPopup>
      )}

      {/* Recommended dishes section */}
      {isDishInCart && (
        <div>
          <MemoRecommendedDishes recommendations={recommendations} openModal={openDishDetails} />
        </div>
      )}
    </div>
  )
}

export default memo(HorizontalCard)

