"use client";;
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { cn } from "@/components/utils/helpers";
import { LuScanLine } from "react-icons/lu";
import { MdAccountBalanceWallet, MdMenuBook } from "react-icons/md";
import { motion } from "framer-motion";
import { PiArrowBendUpLeftBold } from "react-icons/pi";
import { useCallback } from "react";
import { useCart } from "@/components/store/useCart";
import { useLogin } from "@/components/store/useLogin";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useParams, useRouter } from "next/navigation";
import { useUserToken } from "@hi/common/src/useUserToken";
import AddAmountModal from "./addAmountModal";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import dynamic from "next/dynamic";
import Link from "next/link";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import useTableData from "@/components/store/useTableData";
import { FiAward } from "react-icons/fi";

const MemoCart = dynamic(() => import("@/components/organisms/cart"), {
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
  highlight,
}: {
  icon: any;
  label?: string;
  href?: string;
  isSelected: boolean;
  onClick?: () => void;
  highlight?: boolean;
}) => {
  const content = (
    <motion.div
      className="relative z-10 flex min-w-0 flex-1 items-center justify-center"
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className={cn(
          "relative z-10 flex h-[2.35rem] min-w-0 max-w-full items-center justify-center gap-1 rounded-full",
          "px-3 md:px-4"
        )}
        transition={{ type: "spring", stiffness: 800, damping: 50 }}
      >
        {isSelected && (
          <motion.div
            layoutId="outline"
            transition={{ type: "spring", stiffness: 800, damping: 50 }}
            className="absolute inset-0 overflow-hidden rounded-full"
          >
            <div
              className="
                absolute inset-0 rounded-full
                bg-base-100
                shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_3px_10px_rgba(0,0,0,0.16)]
              "
            />
          </motion.div>
        )}

        {highlight && !isSelected && (
          <div
            className="
              absolute inset-0 rounded-full
              bg-base-100
              shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_8px_rgba(0,0,0,0.2)]
            "
          />
        )}

        <Icon
          size={20}
          className={cn(
            "relative z-10 shrink-0 transition-colors duration-200 sm:size-auto",
            isSelected
              ? "text-primary"
              : highlight
              ? "text-primary"
              : "text-base-100"
          )}
        />

        <span
          className={cn(
            "relative z-10 min-w-0 truncate text-[11px] leading-none transition-colors duration-200 sm:text-xs",
            isSelected
              ? "font-medium text-primary"
              : highlight
              ? "font-medium text-primary"
              : "text-base-100"
          )}
        >
          {label}
        </span>
      </motion.div>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="min-w-0 flex-1">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-0 flex-1 border-none bg-transparent p-0"
    >
      {content}
    </button>
  );
};

export default function BottomButton({
  selected,
  showBack,
}: {
  selected?: ButtonType;
  showBack?: boolean;
}) {
  const tableName = useTableData((s) => s.tableName);
  const router = useRouter();
  const setDirection = useLogin((s) => s.setDirection);
  const accessToken = useUserToken.getState().accessToken;
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const setShowCart = useCart((s) => s.setShowCart);
  const showCart = useCart((s) => s.showCart);
  const inputModal = useCart((s) => s.inputModal);
  const setInputModal = useCart((s) => s.setInputModal);
  const setCartPage = useCart((s) => s.setCartPage);

  const { setCheckLogin } = usePaymentStore();
  const customLink = useParams()?.businessId || "";
  const { subscribeModal, reviewPopup } = useLogin((s) => ({
    subscribeModal: s.subscribeModal,
    reviewPopup: s.reviewPopup,
  }));

  const closeModal = useCallback(() => {
    setInputModal(false);
  }, [setInputModal]);

  const openModal = useCallback(() => {
    setDirection("explore");
    if (!accessToken) {
      setCheckLogin(true);
    }
    if (outletInfo?.isPosEnabled) {
      setCartPage("order");
      setShowCart(true);
    } else {
      setInputModal(true);
    }
  }, [
    accessToken,
    setInputModal,
    setDirection,
    outletInfo?.isPosEnabled,
    setShowCart,
    setCartPage,
    setCheckLogin,
  ]);

  const handleRedirection = useCallback(() => {
    if (!accessToken) {
      setCheckLogin(true);
    } else {
      setDirection("loyalty");
      router.push(`/${customLink}/loyalty`);
    }
  }, [accessToken, setDirection, setCheckLogin, customLink, router]);

  const goBack = () => {
    if (showBack) {
      return router.push(`/${customLink}/o`);
    }
    return router.push(`/${customLink}/explore`);
  };

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
          fixed bottom-4 left-4 z-50 w-[calc(100%-2rem)]
          max-w-[30rem] transform overflow-hidden rounded-[1.5rem]
          bg-primary py-3 px-3 shadow-lg
          md:left-1/2 md:-translate-x-1/2
        "
        style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="relative z-10 flex items-center justify-between gap-2">
          {showBack && (
            <MenuItem
              icon={PiArrowBendUpLeftBold}
              onClick={goBack}
              isSelected={false}
              label="Back"
            />
          )}

          <MenuItem
            icon={FiAward}
            label="Rewards"
            isSelected={selectedBtn === "rewards"}
            onClick={handleRedirection}
          />

          {tableName ? (
            outletInfo?.placeOrderButton !== false ? (
              <MenuItem
                icon={MdAccountBalanceWallet}
                label="Pay Bill"
                onClick={openModal}
                isSelected={false}
              />
            ) : null
          ) : (
            <MenuItem
              icon={LuScanLine}
              label="Scan"
              href={`/${customLink}/scan`}
              isSelected={false}
            />
          )}

          {!showBack && (
            <MenuItem
              icon={MdMenuBook}
              label="Menu"
              href={`/${customLink}/category?${
                tableName ? `tableName=${tableName}` : ""
              }`}
              isSelected={selectedBtn === "menu" || selectedBtn === "catalogue"}
              highlight={selectedBtn !== "menu" && selectedBtn !== "catalogue"}
            />
          )}
        </div>
      </motion.nav>

      {inputModal && accessToken && (
        <BottomPopUp
          height="80dvh"
          show={inputModal}
          onClose={closeModal}
          linearGradTheme
        >
          <AddAmountModal />
        </BottomPopUp>
      )}

      {showCart && (
        <BottomPopUp hide show={showCart} onClose={() => setShowCart(false)}>
          <MemoCart />
        </BottomPopUp>
      )}
    </>
  );
}