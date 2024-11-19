"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RiHome4Fill, RiCouponFill } from "react-icons/ri";
import { MdAccountBalanceWallet, MdMenuBook } from "react-icons/md";
import { LuScanLine } from "react-icons/lu";
import { FaConciergeBell } from "react-icons/fa";
import { BsBagHeartFill } from "react-icons/bs";
import { useLogin } from "@/components/store/useLogin";
import useTableData from "@/components/store/useTableData";
import { useUserToken } from "@hi/common/src/useUserToken";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useCart } from "@/components/store/useCart";
import { useCartStore } from "@/components/store/useCartStore";
import { cn } from "@/components/utils/helpers";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import AddAmountModal from "./addAmountModal";
import MemoCallTheWaiterComponent from "./callTheWaiter";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";

const Cart = dynamic(() => import("@/components/organisms/cart"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

export type ButtonType = "home" | "menu" | "catalogue" | "rewards";

const MenuItem = ({
  icon: Icon,
  label,
  href,
  isSelected,
  onClick,
}: {
  icon: any;
  label: string;
  href?: string;
  isSelected: boolean;
  onClick?: () => void;
}) => {
  const content = (
    <motion.div
      className={cn(
        "relative flex flex-col items-center justify-center z-10",
        isSelected ? "w-16 h-16" : "w-14 h-14",
      )}
      animate={isSelected ? { y: -10 } : { y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {isSelected && (
        <motion.div
          className="absolute inset-0 w-12 h-12 rounded-full left-2 -top-2.5 bg-base-300"
          layoutId="outline"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      )}
      <motion.div
        className={cn(
          "relative z-10 flex items-center justify-center",
          isSelected ? "w-12 h-12" : "w-6 h-6",
        )}
        animate={isSelected ? { y: -10 } : { y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Icon
          size={isSelected ? 28 : 24}
          className={cn(
            "relative z-10",
            isSelected ? "text-primary" : "text-base-100",
          )}
        />
      </motion.div>
      <span className="relative z-10 mt-1 text-xs text-base-100">{label}</span>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="p-0 bg-transparent border-none"
    >
      {content}
    </button>
  );
};

export default function BottomButton({ selected }: { selected?: ButtonType }) {
  const router = useRouter();
  const tableName = useTableData((s) => s.tableName);
  const setDirection = useLogin((s) => s.setDirection);
  const accessToken = useUserToken.getState().accessToken;
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const [callWaiterModal, setCallWaiterModal] = useState(false);
  const { setShowCart, showCart, inputModal, setInputModal } = useCart();
  const customLink = useParams()?.businessId || "";
  const cart = useCartStore((s) => s.cart);
  const { subscribeModal, reviewPopup } = useLogin((s) => ({
    subscribeModal: s.subscribeModal,
    reviewPopup: s.reviewPopup,
  }));

  const closeModal = useCallback(() => {
    setInputModal(false);
  }, [setInputModal]);

  const openModal = useCallback(() => {
    if (selected === "menu" || selected === "catalogue") {
      setDirection("category");
    }
    if (!accessToken) {
      router.push(`/${customLink}/user/signup`);
    }
    setInputModal(true);
  }, [selected, accessToken, customLink, setInputModal, setDirection, router]);

  const openCallWaiterModal = useCallback(() => {
    setCallWaiterModal(true);
  }, []);

  const closeCallWaiterModal = useCallback(() => {
    setCallWaiterModal(false);
  }, []);

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
    router,
    customLink,
    tableName,
    openCallWaiterModal,
  ]);

  const showingCart = useCallback(() => {
    setShowCart(!showCart);
  }, [showCart, setShowCart]);

  if (subscribeModal || reviewPopup) {
    return null;
  }

  const selectedBtn =
    outletInfo?.outLetType === "OTHER" && selected === "menu"
      ? "catalogue"
      : selected;

  return (
    <>
      <motion.nav
        className="fixed z-10 bottom-0 w-full max-w-[30rem] bg-primary shadow-lg px-2"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between">
          <MenuItem
            icon={RiHome4Fill}
            label="Home"
            href={`/${customLink}/explore`}
            isSelected={selectedBtn === "home"}
          />
          <MenuItem
            icon={RiCouponFill}
            label="Rewards"
            href={`/${customLink}/${accessToken ? "loyalty" : "user/signup"}`}
            isSelected={selectedBtn === "rewards"}
          />
          {tableName ? (
            <MenuItem
              icon={MdAccountBalanceWallet}
              label="Pay Bill"
              onClick={openModal}
              isSelected={false}
            />
          ) : (
            <MenuItem
              icon={LuScanLine}
              label="Scan"
              href={`/${customLink}/scan`}
              isSelected={false}
            />
          )}
          {outletInfo?.outLetType !== "OTHER" && (
            <MenuItem
              icon={FaConciergeBell}
              label="Captain"
              onClick={triggerCallWaiter}
              isSelected={false}
            />
          )}
          <div className="relative">
            <MenuItem
              icon={BsBagHeartFill}
              label={showCart ? "Menu" : "Cart"}
              onClick={showingCart}
              isSelected={false}
            />
            <AnimatePresence>
              {cart.length > 0 && (
                <motion.span
                  className="absolute z-50 flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-600 rounded-full text-primary-foreground -top-3 right-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  {cart.length}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <MenuItem
            icon={MdMenuBook}
            label={outletInfo?.outLetType === "OTHER" ? "Catalogue" : "Menu"}
            href={`/${customLink}/category`}
            isSelected={selectedBtn === "menu" || selectedBtn === "catalogue"}
          />
        </div>
      </motion.nav>

      {inputModal && accessToken && (
        <BottomPopUp show={inputModal} onClose={closeModal} linearGradTheme>
          <AddAmountModal />
        </BottomPopUp>
      )}
      {callWaiterModal && (
        <BottomPopUp show={callWaiterModal} onClose={closeCallWaiterModal}>
          <MemoCallTheWaiterComponent onClose={closeCallWaiterModal} />
        </BottomPopUp>
      )}
      {showCart && (
        <BottomPopUp show={showCart} onClose={showingCart} hide>
          <Cart />
        </BottomPopUp>
      )}
    </>
  );
}
