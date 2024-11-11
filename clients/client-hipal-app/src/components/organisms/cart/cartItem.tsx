import { memo } from "react";
import { useCartStore } from "@/components/store/useCartStore";
import FoodType from "@/components/atoms/foodType";
import dynamic from "next/dynamic";
import type { DishType } from "@hi/db-models/src/validators";
import ShimmerImage from "@/components/atoms/imageshimmer";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { cn } from "@/components/utils/helpers";

const PlaceholderImg = dynamic(() => import("@/components/atoms/placeholder"));

interface CartItemProp {
  hide?: boolean;
  cartItem: {
    id: string;
    dish: DishType;
    portion: { _id: number; name: string; price: number } | null;
    extras: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    quantity: number;
  };
}

const CartItem = ({ cartItem, hide }: CartItemProp) => {
  const { updateCartItem, removeFromCart } = useCartStore();
  const imageUrl =
    cartItem?.dish?.images?.[0] ||
    cartItem?.dish?.images?.[1] ||
    cartItem?.dish?.images?.[2];

  const increaseQuantity = () => {
    updateCartItem({ ...cartItem, quantity: cartItem.quantity + 1 });
  };

  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const decreaseQuantity = () => {
    if (cartItem.quantity > 1) {
      updateCartItem({ ...cartItem, quantity: cartItem.quantity - 1 });
    } else {
      removeFromCart(cartItem.id);
    }
  };

  const calculateTotalPrice = () => {
    const basePrice = cartItem.dish.price;
    const extrasPrice = cartItem?.extras.reduce(
      (total, extra) => total + extra.price * extra.quantity,
      0,
    );

    const totalPriceForOne = cartItem.portion
      ? cartItem?.portion?.price + extrasPrice
      : basePrice + extrasPrice;

    return totalPriceForOne * cartItem.quantity;
  };
  return (
    <section className="flex items-center justify-between py-4 pl-6 border-b">
      <div className="flex flex-col w-[70%] space-y-1">
        <h5
          className={cn(
            "flex items-start gap-3 text-base font-medium leading-6",
            outletInfo?.outLetType !== "OTHER" ? "-ml-7" : "-ml-3",
          )}
        >
          {outletInfo?.outLetType !== "OTHER" && (
            <div className="-mr-2 scale-75">
              <FoodType types={cartItem?.dish?.dishTypes} />
            </div>
          )}
          {cartItem?.dish?.name}
        </h5>
        {cartItem?.portion && (
          <span className="text-xs text-primary opacity-80">
            Portion: {cartItem?.portion?.name}
          </span>
        )}
        {cartItem?.extras?.length > 0 && (
          <span className="text-xs text-primary opacity-80 ">
            Extras: {cartItem?.extras?.map((extra) => extra.name).join(", ")}
          </span>
        )}
        <div
          className={cn(
            "text-left",
            outletInfo?.outLetType !== "OTHER" ? "-ml-1" : "-ml-3",
          )}
        >
          <span className="block text-sm font-medium text-primary">
            ₹{calculateTotalPrice().toFixed(2)}
          </span>
        </div>
      </div>
      <div className="relative flex items-center justify-between mb-2 -mt-2">
        {imageUrl ? (
          <ShimmerImage
            src={imageUrl}
            alt={cartItem?.dish?.name}
            width={70}
            height={70}
            className="object-cover w-20 h-20 rounded-md"
          />
        ) : (
          <PlaceholderImg className="w-20 h-20 rounded-md" />
        )}
        {hide && (
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
        )}
      </div>
    </section>
  );
};

const MemoizedCartItem = memo(CartItem);
export default MemoizedCartItem;
