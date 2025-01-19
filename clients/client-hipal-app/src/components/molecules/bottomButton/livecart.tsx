"use client";
import { useCartStore } from "@/components/store/useCartStore";
import React, { memo, useCallback } from "react";
import { BiPlus } from "react-icons/bi";
import { FaArrowRightLong } from "react-icons/fa6";
import { PiShoppingCartDuotone } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/store/useCart";
import MemoCart from "@/components/organisms/cart";
import useTableData from "@/components/store/useTableData";
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription";
import TableNameMissing from "./tableNameMissing";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { useSearch } from "@/components/store/useSearch";
import { HiX } from "react-icons/hi";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

const MemoLiveCart = () => {
  const { cart, setSelectedDish } = useCartStore();
  const { setShowCart, setCartPage, showCart } = useCart();

  const { tableNameMissing, setTableNameMissing, tableName } = useTableData();
  const { isSearchActive, setIsSearchActive } = useSearch();
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const shineVariants = {
    initial: { x: "-100%" },
    animate: { x: "100%" },
  };

  const cartVariants = {
    initial: { width: "100%", borderRadius: "0px", bottom: "4.5rem" },
    animate: {
      width: isSearchActive ? "20rem" : "100%",
      borderRadius: isSearchActive ? "9999px" : "0px",
      bottom: isSearchActive ? "4.5rem" : "4.5rem",
    },
  };

  const openCart = useCallback(() => {
    if (!tableNameMissing) {
      setTableNameMissing(true);
    }
    setSelectedDish(null);
    setCartPage("cart");
    setShowCart(true);
  }, [
    setShowCart,
    setCartPage,
    tableNameMissing,
    setTableNameMissing,
  ]);

  return (
    <>
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.section
            onClick={openCart}
            className="fixed flex items-center justify-between overflow-hidden !text-sm
              px-4 py-3 text-[#FFF] max-w-[30rem] z-50 transform
              -translate-x-1/2 left-1/2 bg-[#008800]"
            variants={cartVariants}
            initial="initial"
            animate="animate"
            exit="initial"
            transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none w-full max-w-[30rem]"
              variants={shineVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "backInOut",
              }}
              style={{
                background: "var(--shine-effect)",
              }}
            />
            <button
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
              className="flex items-center gap-2"
            >
              <span>
                {outletInfo?.shareCart ? "Proceed to order" : "Continue"}
              </span>
              <FaArrowRightLong />
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {isSearchActive && (
        <button
          onClick={() => setIsSearchActive(false)}
          className="fixed bottom-0 transform z-[105] left-1/2 -translate-x-1/2 p-3 -translate-y-[30%] bg-gray-300 rounded-full
           text-black"
          type="button"
        >
          <HiX size={24} />
        </button>
      )}
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
