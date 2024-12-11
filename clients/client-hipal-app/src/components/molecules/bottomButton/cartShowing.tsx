"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BsArrowRightShort } from "react-icons/bs";
import { useCartStore } from "@/components/store/useCartStore";
import Image from "next/image";
import { useCart } from "@/components/store/useCart";

export default function CartButton() {
  const cart = useCartStore((state) => state.cart);
  const { setShowCart, showCart, setCartPage } = useCart();
  const [recentlyAddedDish, setRecentlyAddedDish] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  // Watch for changes in cart length to trigger the animation
  useEffect(() => {
    if (cart.length > 0) {
      const lastItem = cart[cart.length - 1];
      if (lastItem?.dish) {
        setRecentlyAddedDish(lastItem.dish);
        setShowAnimation(true);
        // Remove the animation effect after 1 second
        const timer = setTimeout(() => setShowAnimation(false), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [cart.length]);

  const showingCart = useCallback(() => {
    setCartPage("cart");
    setShowCart(!showCart);
  }, [showCart, setShowCart, setCartPage]);

  if (cart.length === 0) return null;

  return (
    <>
      {/* Animation of item getting added to cart */}
      {showAnimation &&
        recentlyAddedDish &&
        recentlyAddedDish?.images?.length > 0 && (
          <motion.div
            className="fixed z-50 w-10 h-10 overflow-hidden bg-white border rounded-full bottom-20 left-10 border-primary"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Image
              src={recentlyAddedDish?.images?.[0]}
              alt={recentlyAddedDish?.name}
              className="object-cover w-full h-full"
              width={40}
              height={40}
            />
          </motion.div>
        )}

      <motion.div
        className="fixed z-50 flex justify-center w-full bottom-[4.75rem]"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <button
          type="button"
          onClick={showingCart}
          className="relative flex items-center justify-between w-1/2 max-w-[20rem] bg-primary text-white rounded-full px-2 py-2 shadow-lg"
        >
          <div className="flex items-center">
            {recentlyAddedDish?.images?.length > 0 ? (
              <div className="w-10 h-10 mr-3 overflow-hidden bg-white rounded-full">
                <Image
                  src={recentlyAddedDish?.images?.[0]}
                  alt={recentlyAddedDish?.name}
                  className="object-cover w-full h-full"
                  width={40}
                  height={40}
                />
              </div>
            ) : (
              <div className="w-10 h-10 mr-3 bg-white rounded-full" />
            )}
          </div>

          <div className="flex flex-col items-start">
            <span className="text-xs font-bold">View Cart</span>
            <span className="text-xs font-medium">{cart.length} items</span>
          </div>

          <div className="ml-auto">
            <BsArrowRightShort size={24} />
          </div>
        </button>
      </motion.div>
    </>
  );
}
