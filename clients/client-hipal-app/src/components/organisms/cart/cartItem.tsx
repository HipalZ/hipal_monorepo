import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/components/store/useCartStore";
import FoodType from "@/components/atoms/foodType";
import { TbMessage2Plus } from "react-icons/tb";
import { BiSolidDish } from "react-icons/bi";
import { GiBubblingBowl } from "react-icons/gi";
import { FaTimes } from "react-icons/fa";
import type { DishType } from "@hi/db-models/src/validators";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { cn } from "@/components/utils/helpers";
import EmptyCart from "./emptyCart";
import { usePathname } from "next/navigation";

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

const tags = ["Best Seller", "Special", "Recommended", "New", "Popular"];

const MemoizedCartItem = ({ cartItem, hide }: CartItemProp) => {
  const {
    selectedDish,
    updateCartItem,
    removeFromCart,
    setInstructionId,
    setOpenInstructionModal,
    removeInstructionFromDish,
  } = useCartStore();
  const path = usePathname();
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  // 🛠️ Filter Logic: Check if the current cart item matches the selected dish
  if (selectedDish && cartItem.dish._id !== selectedDish._id) {
    return null;
  }

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

  const calculateTotalPrice = useCallback(() => {
    const basePrice = cartItem.dish.price;
    const extrasPrice = cartItem?.extras.reduce(
      (total, extra) => total + extra.price * extra.quantity,
      0,
    );
    const totalPriceForOne = cartItem.portion
      ? cartItem?.portion?.price + extrasPrice
      : basePrice + extrasPrice;

    return totalPriceForOne * cartItem.quantity;
  }, [cartItem]);

  const handleInstruction = useCallback(
    (id: string) => {
      setInstructionId(id);
      setOpenInstructionModal(true);
    },
    [setInstructionId, setOpenInstructionModal],
  );

  return (
    <>
      {Object.keys(cartItem).length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="relative flex items-start justify-between px-4 py-3 border-b border-gray-100"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              {outletInfo?.outLetType !== "OTHER" && (
                <div className="flex-shrink-0">
                  <FoodType types={cartItem?.dish?.dishTypes} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-[3px] rounded-lg text-xs font-medium bg-[#DE9615] text-white">
                    {tags[(Math.random() * tags.length) | 0]}
                  </span>
                </div>
                <section
                  className={cn(
                    outletInfo?.outLetType !== "OTHER" ? "-ml-6" : "",
                    "mt-2",
                  )}
                >
                  <article className="flex items-start justify-between gap-4">
                    <h5 className="text-sm w-[75%] leading-5 text-gray-900">
                      {cartItem?.dish?.name}
                    </h5>
                    {!hide && (
                      <div className="flex items-center w-24 max-w-48 h-[30px] bg-[#FC506A10] border border-[#FC506A] rounded-xl overflow-hidden">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={decreaseQuantity}
                          className="w-8 h-full flex items-center justify-center text-[#FC506A] hover:bg-rose-50"
                        >
                          -
                        </motion.button>
                        <span className="w-8 flex items-center justify-center text-sm font-medium text-[#FC506A]">
                          {cartItem.quantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={increaseQuantity}
                          className="w-8 h-full flex items-center justify-center text-[#FC506A] hover:bg-rose-50"
                        >
                          +
                        </motion.button>
                      </div>
                    )}
                  </article>
                  {(cartItem?.portion || cartItem?.extras?.length > 0) && (
                    <div>
                      {cartItem?.portion && (
                        <p className="inline-flex items-center gap-2 text-xs text-gray-500">
                          <BiSolidDish size={16} />{" "}
                          <span>{cartItem?.portion?.name}</span>
                        </p>
                      )}
                      {cartItem?.extras?.length > 0 && (
                        <p className="inline-flex items-center gap-2 text-xs text-gray-500">
                          <GiBubblingBowl size={16} />{" "}
                          <span>
                            {cartItem?.extras
                              ?.map((extra) => extra.name)
                              .join(", ")}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                <span className="block text-[#525252] text-sm font-semibold">
                  ₹{calculateTotalPrice().toFixed(2)}
                </span>
                {!cartItem?.dish?.instruction?.length &&
                  !path.includes("cart") && ( // hide add instruction for cart page
                    <button
                      type="button"
                      onClick={() => handleInstruction(cartItem?.id)}
                      className="inline-flex gap-1 text-xs text-purple-600 underline underline-offset-2 hover:text-purple-700"
                    >
                      <TbMessage2Plus size={16} /> <span>Add instruction</span>
                    </button>
                  )}
              </div>
            </div>
            {cartItem?.dish?.instruction &&
              cartItem?.dish?.instruction?.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <h1 className="text-base text-black">
                    {cartItem?.dish?.instruction}
                  </h1>
                  <button
                    type="button"
                    onClick={() => removeInstructionFromDish(cartItem?.id)}
                    className="inline-flex gap-1 text-xs text-red-600 hover:text-red-700"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              )}
          </div>
        </motion.div>
      ) : (
        <EmptyCart />
      )}
    </>
  );
};

const CartItem = memo(MemoizedCartItem);
export default CartItem;
