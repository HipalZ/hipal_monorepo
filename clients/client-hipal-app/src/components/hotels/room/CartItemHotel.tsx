import FoodType from '@/components/atoms/foodType';
import EmptyCart from '@/components/organisms/cart/emptyCart';
import { _useAllBusiness } from '@/components/store/useAllBusiness';
import { useCartStore } from '@/components/store/useCartStore';
import { cn } from '@/components/utils/helpers';
import type { DishType } from '@hi/db-models/src/validators';
import { motion } from 'framer-motion';
import { memo, useCallback, type MouseEvent } from 'react';
import { BiSolidDish } from 'react-icons/bi';
import { FaTimes } from 'react-icons/fa';
import { GiBubblingBowl } from 'react-icons/gi';
import { TbMessage2Plus } from 'react-icons/tb';

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

type CartDish = DishType & { instruction?: string };

const tags = ['Best Seller', 'Special', 'Recommended', 'New', 'Popular'];

const MemoizedCartItemHotel = ({ cartItem, hide }: CartItemProp) => {
  const { selectedDish, updateCartItem, removeFromCart, setInstructionId, setOpenInstructionModal, removeInstructionFromDish } = useCartStore();
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const dish = cartItem.dish as CartDish;

  // 🛠️ Filter Logic: Check if the current cart item matches the selected dish
  if (selectedDish && dish._id !== selectedDish._id) {
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
    const basePrice = dish.price;
    const extrasPrice = cartItem?.extras.reduce((total, extra) => total + extra.price * extra.quantity, 0);
    const totalPriceForOne = cartItem.portion ? cartItem?.portion?.price + extrasPrice : basePrice + extrasPrice;

    return totalPriceForOne * cartItem.quantity;
  }, [cartItem, dish.price]);

  const handleInstruction = useCallback(
    (event: MouseEvent<HTMLButtonElement>, id: string) => {
      event.preventDefault();
      event.stopPropagation();
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
          className="relative flex items-start justify-between border-b border-gray-100 px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start gap-2">
              {outletInfo?.outLetType !== 'OTHER' && (
                <div className="flex-shrink-0">
                  <FoodType types={dish.dishTypes as never} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-lg bg-[#DE9615] px-2 py-[3px] text-xs font-medium text-white">
                    {tags[(Math.random() * tags.length) | 0]}
                  </span>
                </div>
                <section className={cn(outletInfo?.outLetType !== 'OTHER' ? '-ml-6' : '', 'mt-2')}>
                  <article className="flex items-start justify-between gap-4">
                    <h5 className="w-[75%] text-sm leading-5 text-gray-900">{dish.name}</h5>
                    {!hide && (
                      <div className="flex h-[30px] w-24 max-w-48 items-center overflow-hidden rounded-xl border border-[#FC506A] bg-[#FC506A10]">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={decreaseQuantity}
                          className="flex h-full w-8 items-center justify-center text-[#FC506A] hover:bg-rose-50"
                        >
                          -
                        </motion.button>
                        <span className="flex w-8 items-center justify-center text-sm font-medium text-[#FC506A]">{cartItem.quantity}</span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={increaseQuantity}
                          className="flex h-full w-8 items-center justify-center text-[#FC506A] hover:bg-rose-50"
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
                          <BiSolidDish size={16} /> <span>{cartItem?.portion?.name}</span>
                        </p>
                      )}
                      {cartItem?.extras?.length > 0 && (
                        <p className="inline-flex items-center gap-2 text-xs text-gray-500">
                          <GiBubblingBowl size={16} /> <span>{cartItem?.extras?.map((extra) => extra.name).join(', ')}</span>
                        </p>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {calculateTotalPrice() > 1 && <span className="block text-sm font-semibold text-[#525252]">₹{calculateTotalPrice().toFixed(2)}</span>}
                {!dish.instruction?.length && (
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => handleInstruction(event, cartItem?.id)}
                    className="inline-flex gap-1 text-xs text-purple-600 underline underline-offset-2 hover:text-purple-700"
                  >
                    <TbMessage2Plus size={16} /> <span>Add instruction</span>
                  </button>
                )}
              </div>
            </div>
            {dish.instruction && dish.instruction.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <h1 className="text-base text-black">{dish.instruction}</h1>
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

const CartItemHotel = memo(MemoizedCartItemHotel);
export default CartItemHotel;
