"use client";
import { useCartStore } from "@/components/store/useCartStore";
import React, { memo, useCallback } from "react";
import { BiPlus } from "react-icons/bi";
import { FaArrowRightLong } from "react-icons/fa6";
import { PiShoppingCartDuotone } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/store/useCart";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import MemoRestaurantCart from "./LiveCart";

const MemoLiveCart = () => {
    const { cart, setSelectedDish } = useCartStore();
    const { setShowCart, setCartPage, showCart } = useCart();

    const shineVariants = {
        initial: { x: "-100%" },
        animate: { x: "100%" },
    };

    // bottom = height of the fixed "Place Orders" action bar (~4rem)
    // so this bar always sits directly above it, never overlapping.
    const cartVariants = {
        initial: { width: "100%", borderRadius: "0px", bottom: "4rem" },
        animate: {
            width: "100%",
            borderRadius:  "0px",
            bottom:  "4rem",
        },
    };

    const openCart = useCallback(() => {
        setSelectedDish(null);
        setCartPage("cart");
        setShowCart(true);
    }, [
        setShowCart,
        setCartPage,
    ]);

    return (
        <>
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.section
                        onClick={openCart}
                        className="fixed flex items-center justify-between overflow-hidden !text-sm
              px-4 py-3 text-[#FFF] max-w-[30rem] z-[1000] transform
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
                                See Cart
                            </span>
                            <FaArrowRightLong />
                        </button>
                    </motion.section>
                )}
            </AnimatePresence>
            {showCart && (
                <BottomPopUp rightTopBack show={showCart} onClose={() => setShowCart(false)} hide>
                    <MemoRestaurantCart />
                </BottomPopUp>
            )}
        </>
    );
};

const LiveCartHotel = memo(MemoLiveCart);
export default LiveCartHotel;
