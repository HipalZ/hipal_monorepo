"use client";
import { memo, useCallback, useState } from "react";
import BottomButton from ".";
import { useParams, useRouter } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";

import AddAmountModal from "./addAmountModal";
import CallTheWaiterComponent from "./callTheWaiter";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useTableData from "@/components/store/useTableData";
import { FaConciergeBell, FaMoneyBillWave } from "react-icons/fa";
import { BsBagHeartFill } from "react-icons/bs";
import { useCart } from "@/components/store/useCart";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import dynamic from "next/dynamic";
import { useCartStore } from "@/components/store/useCartStore";
import { useSearch } from "@/components/store/useSearch";
import Link from "next/link";
import { useUserToken } from "@hi/common/src/useUserToken";
import { RiHome4Fill } from "react-icons/ri";
import MemoBottomPopUp from "@/components/atoms/bottomPopUp";

const Cart = dynamic(() => import("@/components/organisms/cart"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const CategoryPageBtn = () => {
  const accessToken = useUserToken.getState().accessToken;
  const { businessId } = useBusinessDetails((s) => ({
    businessId: s.businessDetails?._id,
  }));
  const { isSearchActive } = useSearch();
  const customLink = useParams()?.businessId as string;
  const tableName = useTableData((s) => s.tableName);
  const [inputModal, setInputModal] = useState(false);
  const setDirection = useLogin((s) => s.setDirection);
  const setIsPayment = useLogin((s) => s.setIsPayment);
  const router = useRouter();
  const [callWaiterModal, setCallWaiterModal] = useState(false);
  const { setShowCart, showCart } = useCart();
  const cart = useCartStore((s) => s.cart);


  const closeModal = useCallback(() => {
    setInputModal(false);
    setIsPayment(false);
  }, [setIsPayment]);

  const openModal = useCallback(() => {
    setInputModal(true);
  }, []);

  const openCallWaiterModal = useCallback(() => {
    setCallWaiterModal(true);
  }, []);

  const closeCallWaiterModal = useCallback(() => {
    setCallWaiterModal(false);
  }, []);

  const proceedToPayment = useCallback(() => {
    setDirection("category");
    if (!tableName) {
      setIsPayment(true);
      return router.push(`/${customLink}/scan`);
    }
    if (!accessToken) {
      setIsPayment(true);
      return router.push(`/${customLink}/user/signup`);
    }
      openModal();
  }, [
    setDirection,
    accessToken,
    businessId,
    router,
    customLink,
    tableName,
    openModal,
  ]);

  const triggerCallWaiter = useCallback(() => {
    setDirection("category");
    if (!tableName) {
      return router.push(`/${customLink}/scan`);
    }
    if (!accessToken) {
      return router.push(`/${customLink}/user/signup`);
    }
    openCallWaiterModal();
  }, [
    setDirection,
    accessToken,
    businessId,
    router,
    customLink,
    tableName,
    openCallWaiterModal,
  ]);

  const showingCart = useCallback(() => {
    setShowCart(!showCart);
  }, [showCart, setShowCart]);


  return (
    <>
      {!isSearchActive && (
        <BottomButton>
          <section className="relative flex items-center justify-between w-full gap-4 text-xs">
            <Link href={`/${customLink}/explore`} className="w-full">
              <center className="font-light text-base-100">
                <RiHome4Fill size={20} className="mb-2" />
                Home
              </center>
            </Link>
            <center
              onClick={triggerCallWaiter}
              className="w-full font-light text-base-100 "
            >
              <FaConciergeBell size={20} className="mb-2" />
              Call captain
            </center>
            <center
              onClick={showingCart}
              className="w-full font-light text-base-100"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key="bag"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="relative">
                    <BsBagHeartFill size={20} className="mb-2" />
                    {cart.length > 0 && (
                      <motion.span
                        className="absolute p-1 px-2 text-xs font-bold text-white bg-red-600 rounded-full left-1/2 -top-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {cart.length}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
              {showCart ? "Menu" : "Cart"}
            </center>
            <center
              onClick={proceedToPayment}
              className="w-full font-light text-base-100"
            >
              <FaMoneyBillWave size={20} className="mb-2" />
              Pay bill
            </center>
          </section>
        </BottomButton>
      )}

      {inputModal && (
        <MemoBottomPopUp show={inputModal} onClose={closeModal}>
          <AddAmountModal />
        </MemoBottomPopUp>
      )}

      {callWaiterModal && (
        <MemoBottomPopUp show={callWaiterModal} onClose={closeCallWaiterModal}>
          <CallTheWaiterComponent onClose={closeCallWaiterModal} />
        </MemoBottomPopUp>
      )}
      {showCart && (
        <MemoBottomPopUp show={showCart} onClose={showingCart}>
          <Cart />
        </MemoBottomPopUp>
      )}
    </>
  );
};

const MemoCategoryPageBtn = memo(CategoryPageBtn);
export default MemoCategoryPageBtn;
