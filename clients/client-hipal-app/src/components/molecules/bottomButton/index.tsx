"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { RiCouponFill } from "react-icons/ri";
import { MdAccountBalanceWallet, MdMenuBook } from "react-icons/md";
import { LuScanLine } from "react-icons/lu";
import { useLogin } from "@/components/store/useLogin";
import useTableData from "@/components/store/useTableData";
import { useUserToken } from "@hi/common/src/useUserToken";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useCart } from "@/components/store/useCart";
import { cn } from "@/components/utils/helpers";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import AddAmountModal from "./addAmountModal";
import MemoCallTheWaiterComponent from "./callTheWaiter";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription";
import CartButton from "./cartShowing";

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
        "relative flex flex-col items-center justify-center z-10 px-2",
      )}
      // animate={isSelected ? { y: 0 } : { y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className={cn(
          "relative z-10 flex items-center space-x-1 justify-center px-2",
        )}
        // animate={isSelected ? { y: -10 } : { y: 0 }}
        transition={{ type: "spring", stiffness: 800, damping: 50 }}
      >
        {isSelected && (
          <motion.div
            className="absolute inset-0 w-full h-[3rem] px-4 rounded-full -top-2.5 bg-base-300"
            layoutId="outline"
            transition={{ type: "spring", stiffness: 800, damping: 50 }}
          />
        )}
        <Icon
          size={isSelected ? 28 : 24}
          className={cn(
            "relative z-10",
            isSelected ? "text-primary" : "text-base-100",
          )}
        />
        <span className="relative z-10 mt-1 text-xs text-base-100 text-nowrap">
          {label}
        </span>
      </motion.div>
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
  const { setShowCart, showCart, inputModal, setInputModal, setCartPage } =
    useCart();
  const customLink = useParams()?.businessId || "";
  const { subscribeModal, reviewPopup } = useLogin((s) => ({
    subscribeModal: s.subscribeModal,
    reviewPopup: s.reviewPopup,
  }));

  const closeModal = useCallback(() => {
    setInputModal(false);
  }, [setInputModal]);
  const showingCart = useCallback(() => {
    setCartPage("cart");
    setShowCart(!showCart);
  }, [showCart, setShowCart, setCartPage]);

  const openModal = useCallback(() => {
    if (selected === "menu" || selected === "catalogue") {
      setDirection("category");
    }
    if (!accessToken) {
      router.push(`/${customLink}/user/signup`);
    }
    if (outletInfo?.isPosEnabled) {
      setCartPage("order");
      setShowCart(!showCart);
    } else {
      setInputModal(true);
    }
  }, [
    selected,
    showCart,
    accessToken,
    customLink,
    setInputModal,
    setDirection,
    outletInfo?.isPosEnabled,
    setShowCart,
  ]);

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

  if (subscribeModal || reviewPopup) {
    return null;
  }
  const shineVariants = {
    initial: { x: "-100%" },
    animate: { x: "100%" },
  };

  const selectedBtn =
    outletInfo?.outLetType === "OTHER" && selected === "menu"
      ? "catalogue"
      : selected;

  return (
    <>
      <motion.nav
        className="
          fixed z-50 bottom-4 w-[calc(100%-2rem)] 
          left-4 max-w-[30rem] bg-primary shadow-lg
          transform md:-translate-x-1/2 md:left-1/2
          overflow-hidden rounded-full py-4
        "
        style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
        <div className="flex items-center justify-between">
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
          <MenuItem
            icon={MdMenuBook}
            label={outletInfo?.outLetType === "OTHER" ? "Catalogue" : "Menu"}
            href={`/${customLink}/category`}
            isSelected={selectedBtn === "menu" || selectedBtn === "catalogue"}
          />
        </div>
        <CartButton />
      </motion.nav>

      {inputModal && accessToken && (
        <BottomPopUp show={inputModal} onClose={closeModal} linearGradTheme>
          <AddAmountModal />
        </BottomPopUp>
      )}
      {callWaiterModal && (
        <ItemDescriptionPopup
          show={callWaiterModal}
          onClose={closeCallWaiterModal}
          heading="Help"
        >
          <MemoCallTheWaiterComponent onClose={closeCallWaiterModal} />
        </ItemDescriptionPopup>
      )}
      {showCart && (
        <BottomPopUp show={showCart} onClose={showingCart} hide>
          <Cart />
        </BottomPopUp>
      )}
    </>
  );
}
