"use client"
import { memo, useState, useCallback } from "react"
import type { DishType } from "@hi/db-models/src/validators"
import { cn } from "@hi/common"
import { useCartStore } from "@/components/store/useCartStore"
import { useActiveClass } from "@/components/store/useActiveClass"
import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton"
import MemoFoodType from "../foodType"
import { ImageOff } from "lucide-react"
import ItemDescriptionPopup from "../dishDescription/itemDescription"
import MemoDishPopup from "../dishPopup"
import CommonBottomButton from "../bottomButton"
import MemoRecommendedDishes from "@/components/organisms/dishDescription/recommendedDishes"
import { useCart } from "@/components/store/useCart"

interface GridDishCardProps {
    dishData: DishType
    primaryColor?: string
    secondaryColor?: string
}

const GridDishCard = ({ dishData, primaryColor = "#000000", secondaryColor = "#f5f5f5" }: GridDishCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { addToCart, cart } = useCartStore()
    const { setSelectedDish,isSelectedDish } = useActiveClass()
     const { setCartPage, setShowCart } = useCart()

    // Check if dish is in cart
    // Open dish details modal
    const openDishDetails = useCallback(() => {
        setSelectedDish(dishData)
        setIsModalOpen(true)
    }, [dishData, setSelectedDish])

    const closeModal = useCallback(() => {
        setSelectedDish({} as DishType)
        setIsModalOpen(false)
      }, [setSelectedDish])

      const openCart = useCallback(() => {
        setSelectedDish(null)
        setCartPage("cart")
        setShowCart(true)
      }, [setShowCart, setCartPage, setSelectedDish])

    const cartItems = cart.filter((item) => item.dish?._id === dishData._id)
    const isDishInCart = cartItems.length > 0
    const recommendations = isDishInCart ? dishData.recommendationIds || [] : []
  

    return (
        <div className="flex flex-col relative pb-[5rem] overflow-hidden border border-gray-200 rounded-lg">
            {/* Image section */}
            <div className="w-full cursor-pointer aspect-square" onClick={openDishDetails}>
                {dishData.images && dishData.images.length > 0 ? (
                    <img
                        src={dishData.images[0] || "/placeholder.svg"}
                        alt={dishData.name}
                        className={cn("object-cover w-full h-full", !dishData.availability && "grayscale")}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full" style={{ backgroundColor: secondaryColor }}>
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
            <div className="p-3">
                <div className="my-auto">
                    <MemoFoodType types={dishData?.dishTypes} />
                </div>
                <h3 className="mt-4 text-base font-semibold leading-5 text-black h-[2.5rem] line-clamp-2" onClick={openDishDetails}>
                    {dishData.name}
                </h3>

                <p className="mt-4 font-semibold text-black opacity-60">
                    ₹{dishData.price.toFixed(2)}
                </p>

                {dishData.description && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{dishData.description}</p>}

            </div>
            {dishData.availability ?
                <section className="absolute flex flex-col items-center justify-center w-full bottom-4">

                    <DishQuantityButton primaryColor={primaryColor} secondaryColor={secondaryColor} className="w-[90%]" dishData={dishData} />
                    <div className="text-xs opacity-50 bg-white text-[#000000] absolute -bottom-0.5 z-10">
                        {(dishData?.addOnIds?.length ||
                            dishData?.portions?.length) > 0
                            ? "customizable"
                            : null}
                    </div>
                </section>

                : (
                    <div className="px-3 py-1 mt-2 text-xs text-center text-gray-500 bg-gray-200 rounded-md">Not Available</div>
                )}
            {isModalOpen && (
                <ItemDescriptionPopup show={isModalOpen} onClose={closeModal}>
                    <MemoDishPopup dishData={isSelectedDish} />
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

export default memo(GridDishCard)

