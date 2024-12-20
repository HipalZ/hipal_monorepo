"use client";
import { useCartStore } from "@/components/store/useCartStore";
import React, { memo, useCallback } from "react";
import { BiPlus } from "react-icons/bi";
import { FaArrowRightLong } from "react-icons/fa6";
import { PiShoppingCartDuotone } from "react-icons/pi";
import { motion } from "framer-motion";
import { useCart } from "@/components/store/useCart";
import MemoCart from "@/components/organisms/cart";
import useTableData from "@/components/store/useTableData";
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription";
import TableNameMissing from "./tableNameMissing";
import BottomPopUp from "@/components/atoms/bottomPopUp";

const MemoLiveCart = () => {
  const cart = useCartStore((s) => s.cart);
  const { setShowCart, cartPage, setCartPage, showCart } = useCart();
  const { tableNameMissing, setTableNameMissing, tableName } = useTableData();
  const shineVariants = {
    initial: { x: "-100%" },
    animate: { x: "100%" },
  };

  const openCart = useCallback(() => {
    if (!tableNameMissing) {
      setTableNameMissing(true);
      return;
    }
    setCartPage("cart");
    setShowCart(true);
  }, [
    cartPage,
    showCart,
    setShowCart,
    setCartPage,
    tableNameMissing,
    setTableNameMissing,
  ]);

  return (
    <>
      {cart.length > 0 ? (
        <section
          className="fixed flex items-center justify-between overflow-hidden !text-sm
     px-4 py-3 w-full text-[#FFF] max-w-[30rem] z-50 transform
      -translate-x-1/2 -translate-y-1/2 left-1/2 bottom-[3.5rem] bg-[#008800]"
        >
          <motion.div
            className="absolute inset-0 pointer-events-none w-full max-w-[30rem]"
            variants={shineVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 2,
              repeat: Infinity,
              // repeatDelay: 1,
              ease: "backInOut",
            }}
            style={{
              background: "var(--shine-effect)",
            }}
          />
          <button
            onClick={openCart}
            type="button"
            className="flex items-center gap-2"
          >
            <PiShoppingCartDuotone size={24} />
            <span className="flex items-center text-base font-semibold">
              <BiPlus strokeWidth={1.5} />
              {cart.length}
            </span>
            <span>Items</span>
          </button>
          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2"
          >
            <span>Proceed to order</span>
            <FaArrowRightLong />
          </button>
        </section>
      ) : null}
      {showCart && tableName ? (
        <BottomPopUp show={showCart} onClose={() => setShowCart(false)} hide>
          <MemoCart />
        </BottomPopUp>
      ) : (
        <ItemDescriptionPopup
          bottomCross
          show={showCart}
          onClose={() => setShowCart(false)}
          heading="Table Name Missing"
        >
          <TableNameMissing />
        </ItemDescriptionPopup>
      )}
    </>
  );
};

const LiveCart = memo(MemoLiveCart);
export default LiveCart;
