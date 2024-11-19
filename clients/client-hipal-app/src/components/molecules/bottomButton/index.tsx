"use client";
import { type ButtonHTMLAttributes, memo, useCallback, useState } from "react";
import { MdAccountBalanceWallet, MdMenuBook } from "react-icons/md";
import Link from "next/link";
import { useLogin } from "@/components/store/useLogin";
import { LuScanLine } from "react-icons/lu";
import AddAmountModal from "./addAmountModal";
import useTableData from "@/components/store/useTableData";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { RiCouponFill, RiHome4Fill } from "react-icons/ri";
import { useUserToken } from "@hi/common/src/useUserToken";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { cn } from "@/components/utils/helpers";
import { FaConciergeBell } from "react-icons/fa";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import MemoCallTheWaiterComponent from "./callTheWaiter";
import { useCart } from "@/components/store/useCart";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { BsBagHeartFill } from "react-icons/bs";
import { useCartStore } from "@/components/store/useCartStore";

const Cart = dynamic(() => import("@/components/organisms/cart"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

export type ButtonType = "home" | "menu" | "catalogue" | "rewards";

function MemoBottomButton({
  selected,
}: {
  selected?: ButtonType;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableName = useTableData((s) => s.tableName);
  const setDirection = useLogin((s) => s.setDirection);
  const accessToken = useUserToken.getState().accessToken;
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const [callWaiterModal, setCallWaiterModal] = useState(false);
  const { setShowCart, showCart, inputModal, setInputModal } = useCart();
  const isPayment = searchParams.get("pay");
  const customLink = useParams()?.businessId || "";
  const cart = useCartStore((s) => s.cart);
  const { subscribeModal, reviewPopup } = useLogin((s) => ({
    subscribeModal: s.subscribeModal,
    reviewPopup: s.reviewPopup,
  }));

  const closeModal = useCallback(() => {
    setInputModal(false);
  }, [inputModal, isPayment]);

  const openModal = useCallback(() => {
    if (selected === "menu" || selected === "catalogue") {
      setDirection("category");
    }
    if (!accessToken) {
      router.push(`/${customLink}/user/signup`);
    }
    setInputModal(true);
  }, [selected, accessToken, customLink, inputModal]);

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

  const MenuItem = ({
    icon: Icon,
    label,
    href,
    onClick,
  }: {
    icon: any;
    label: string;
    href?: string;
    onClick?: () => void;
  }) => {
    const content = (
      <>
        {selectedBtn === label.toLowerCase() && (
          <div className="absolute z-[-1] w-11 h-[32px] rounded-t-full -top-1 bg-base-300" />
        )}
        {selectedBtn === label.toLowerCase() && (
          <div className="absolute z-[-1] w-14  h-2.5 rounded-b-md -top-2 bg-base-300" />
        )}
        <Icon
          size={24}
          fill={selectedBtn === label.toLowerCase() ? "var(--p)" : "var(--s)"}
        />
        <h3
          className={cn(
            "text-[0.625rem]",
            selectedBtn === label.toLowerCase() ? "pt-1" : "mt-0",
          )}
        >
          {label}
        </h3>
      </>
    );

    if (href) {
      return (
        <Link href={href} className="">
          <div
            className={cn(
              "relative w-[16.5dvw] max-w-[5rem] flex flex-col items-center justify-center  z-10",
              selectedBtn === label.toLowerCase() ? "space-y-0" : "space-y-1",
            )}
          >
            {content}
          </div>
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={cn(
          "relative w-[16.5dvw] max-w-[5rem] flex flex-col items-center justify-center  z-10",
          selectedBtn === label.toLowerCase() ? "space-y-0" : "space-y-1",
        )}
        onClick={onClick}
      >
        {content}
      </button>
    );
  };

  return (
    <>
      <section className="fixed z-10 bottom-0 w-full max-w-[30rem] py-2 bg-primary shadow-lg">
        <nav className="flex items-center justify-between">
          <MenuItem
            icon={RiHome4Fill}
            label="Home"
            href={`/${customLink}/explore`}
          />
          <MenuItem
            icon={RiCouponFill}
            label="Rewards"
            href={`/${customLink}/${accessToken ? "loyalty" : "user/signup"}`}
          />
          {tableName ? (
            <MenuItem
              icon={MdAccountBalanceWallet}
              label="Pay Bill"
              onClick={openModal}
            />
          ) : (
            <MenuItem
              icon={LuScanLine}
              label="Scan"
              href={`/${customLink}/scan`}
            />
          )}
          {outletInfo?.outLetType !== "OTHER" ? (
            <MenuItem
              icon={FaConciergeBell}
              label="Captain"
              onClick={triggerCallWaiter}
            />
          ) : null}
          <div className="relative">
            <MenuItem
              icon={BsBagHeartFill}
              label={showCart ? "Menu" : "Cart"}
              onClick={showingCart}
            />
            <AnimatePresence initial={false} mode="wait">
              {cart.length > 0 && (
                <motion.span
                  className="absolute z-50 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full -top-4 right-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.5 }}
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
          />
        </nav>
      </section>

      {inputModal && (
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

const BottomButton = memo(MemoBottomButton);
export default BottomButton;
