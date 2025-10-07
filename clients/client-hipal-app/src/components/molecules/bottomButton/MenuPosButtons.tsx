import type { FC } from "react";
import { motion } from "framer-motion";
import { PiArrowBendUpLeftBold } from "react-icons/pi";
import { BsHandIndexThumb } from "react-icons/bs";
import SwipeToPlaceOrder from "../../organisms/cart/swipeToPlaceOrder";
import type { CommonProps } from "../../organisms/cart/CartButtons";

const MenuPosButtons = ({
  cartPage,
  cart,
  onBack,
  onTriggerWaiter,
  onMenuPosPlaceOrder,
  placeOrderButton,
}: CommonProps) => {
  if (cartPage !== "cart") return null;
  const cartHasItems = cart.length > 0;

  return (
    <div className="flex items-center gap-3 px-2">
      <button
        onClick={onBack}
        type="button"
        className="h-12 w-16 px-4 py-1 border border-[#CACACA] rounded-lg text-center"
      >
        <PiArrowBendUpLeftBold size={24} />
      </button>

      {placeOrderButton ? (
        <SwipeToPlaceOrder
          placeOrder={onMenuPosPlaceOrder!}
          disabled={!cartHasItems}
        />
      ) : (
        <motion.button
          type="button"
          className="w-full flex justify-center items-center gap-2 py-3 rounded-lg border border-gray-300 text-sm font-medium text-white bg-black shadow-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onTriggerWaiter}
        >
          <BsHandIndexThumb size={20} />
          <span>Call Captain</span>
        </motion.button>
      )}
    </div>
  );
};

export default MenuPosButtons;
