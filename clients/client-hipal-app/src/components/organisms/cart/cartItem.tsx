import React, { memo, useState } from "react";
import { useCartStore } from "@/components/store/useCartStore";
import Image from "next/image";
import FoodType, { type FOOD_TYPES } from "@/components/atoms/foodType";
import dynamic from "next/dynamic";
import DishData from "@/components/atoms/dishDescription";
import DishPopup from "@/components/atoms/dishPopup";
import type { DishType } from "@hi/db-models/src/validators";

const PlaceholderImg = dynamic(() => import("@/components/atoms/placeholder"));

interface CartItemProp {
  cartItem: {
    id: string;
    dish: DishType;
    portion: { _id: number; name: string; price: number } | null;
    extras: Array<{ id: string; name: string; quantity: number; price: number }>;
    quantity: number;
  };
}

const CartItem = ({ cartItem }: CartItemProp) => {
  const { updateCartItem, removeFromCart } = useCartStore();
  const imageUrl = cartItem.dish.images[0] || cartItem.dish.images[1] || cartItem.dish.images[2];
  const [showDescription, setShowDescription] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DishType>({} as DishType);

  const openModal = (dishData: DishType) => {
    setSelectedDish(dishData);
    setShowDescription(true);
  };

  const closeModal = () => {
    setSelectedDish({} as DishType);
    setShowDescription(false);
  };

  const increaseQuantity = () => {
    updateCartItem({ ...cartItem, quantity: cartItem.quantity + 1 });
  };

  const decreaseQuantity = () => {
    if (cartItem.quantity > 1) {
      updateCartItem({ ...cartItem, quantity: cartItem.quantity - 1 });
    } else {
      removeFromCart(cartItem.id);
    }
  };

  return (
    <section className="flex items-center justify-between p-4 border-b">
      <div className="flex flex-col w-[70%]">
        <FoodType type={cartItem.dish.dishType as FOOD_TYPES} />
        <span className="my-2 text-lg font-semibold">
          <span>{cartItem.quantity} X</span> {cartItem.dish.name}
        </span>
        {cartItem.portion && (
          <span className="pb-2 text-xs text-gray-600">
            Portion: {cartItem.portion.name}
          </span>
        )}
        {cartItem.extras.length > 0 && (
          <span className="pb-2 text-xs text-gray-600">
            Extras: {cartItem.extras.map((extra) => extra.name).join(", ")}
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
        <div className="absolute transform -translate-x-1/2 translate-y-[50%] left-1/2 top-[70%] text-xs">
          <div className="flex items-center justify-between border bg-base-100 text-primary rounded-xl border-primary">
            <button
              type="button"
              onClick={decreaseQuantity}
              className="px-2 py-1"
            >
              -
            </button>
            <span className="mx-2">{cartItem.quantity}</span>
            <button
              type="button"
              onClick={increaseQuantity}
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
