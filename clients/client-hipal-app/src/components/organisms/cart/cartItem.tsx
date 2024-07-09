import React, { memo, useState } from "react";
import {
  type CartItem as CartItemProps,
  useDishCart,
} from "@/components/store/useDishCart";
import Image from "next/image";
import FoodType, { type FOOD_TYPES } from "@/components/atoms/foodType";
import { FaBookmark } from "react-icons/fa";
import dynamic from "next/dynamic";
import DishData from "@/components/atoms/dishDescription";
import DishPopup from "@/components/atoms/dishPopup";
import type { IDish } from "@/components/types/businessData";

const PlaceholderImg = dynamic(() => import("@/components/atoms/placeholder"));

interface CartItemProp {
  cart: CartItemProps;
}

const CartItem = ({ cart: cartItem }: CartItemProp) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useDishCart();
  const imageUrl =
    cartItem.dish.images[0] ||
    cartItem.dish.images[1] ||
    cartItem.dish.images[2];
  const [showDescription, setShowDescription] = useState(false);
  const [selectedDish, setSelectedDish] = useState<IDish>({} as IDish);

  const openModal = (dishData: IDish) => {
    setSelectedDish(dishData);
    setShowDescription(true);
  };

  const closeModal = () => {
    setSelectedDish({} as IDish);
    setShowDescription(false);
  };

  return (
    <section className="flex items-center justify-between p-4 border-b">
      <div className="flex flex-col w-[70%]">
        <FoodType type={cartItem.dish.dishType as FOOD_TYPES} />
        <span className="my-2 text-lg font-semibold">
          {" "}
          <span>{cartItem.quantity} X</span> {cartItem.dish.name}
        </span>
        {cartItem.selectedPortion && (
          <span className="pb-2 text-xs text-gray-600">
            Portion: {cartItem.selectedPortion}
          </span>
        )}
        {cartItem.selectedExtras.length > 0 && (
          <span className="pb-2 text-xs text-gray-600">
            Extras:{" "}
            {cartItem.selectedExtras.map((extra) => extra.name).join(", ")}
          </span>
        )}
        <span
          onClick={() => openModal(cartItem.dish)}
          className="bg-base-100/50 text-center px-2 py-0.25 w-12 rounded-full border-1 border border-primary text-sm cursor-pointer"
        >
          Info
        </span>
      </div>
      <div className="relative flex items-center justify-between">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={cartItem.dish.name}
            width={70}
            height={70}
            className="object-cover w-20 h-20 rounded-md"
          />
        ) : (
          <PlaceholderImg className="w-20 h-20 rounded-md" />
        )}
        <div className="absolute transform -translate-x-1/2 translate-y-[50%] left-1/2 top-[70%] text-xs ">
          <div className="flex items-center justify-between border bg-base-100 text-primary rounded-xl border-primary">
            <button
              type="button"
              onClick={() => decreaseQuantity(cartItem.id || "")}
              className="px-2 py-1"
            >
              -
            </button>
            <span className="mx-2">{cartItem.quantity}</span>
            <button
              type="button"
              onClick={() => increaseQuantity(cartItem.id || "")}
              className="px-2 py-1"
            >
              +
            </button>
          </div>
        </div>
        {showDescription && (
          <DishData show={showDescription} onClose={closeModal}>
            <div className="relative py-4 mx-4">
              <DishPopup dishData={selectedDish} />
            </div>
          </DishData>
        )}
      </div>
    </section>
  );
};

const MemoizedCartItem = memo(CartItem);
export default MemoizedCartItem;
