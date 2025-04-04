"use client";

import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { cn } from "@/components/utils/helpers";
import { LuScanLine } from "react-icons/lu";
import { MdAccountBalanceWallet, MdMenuBook } from "react-icons/md";
import { motion } from "framer-motion";
import { PiArrowBendUpLeftBold } from "react-icons/pi";
import { RiCouponLine } from "react-icons/ri";
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
}: {
    icon: any;
    label?: string;
    href?: string;
    isSelected: boolean;
    onClick?: () => void;
}) => {
    const content = (
        <motion.div
            className={cn(
                "relative flex flex-col items-center justify-center z-10 px-2",
            )}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <motion.div
                className={cn(
                    "relative z-10 flex items-center space-x-1 justify-center px-2",
                )}
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

export default function ServiceBottomButton({
    selected,
    showBack,
}: { selected?: ButtonType; showBack?: boolean }) {
    const tableName = useTableData((s) => s.tableName);
    const router = useRouter()
    const setDirection = useLogin((s) => s.setDirection);
    const accessToken = useUserToken.getState().accessToken;
    const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
    const { setShowCart, showCart, inputModal, setInputModal, setCartPage } =
        useCart();
    const { setCheckLogin } = usePaymentStore()
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
        setCheckLogin
    ]);

    const handleRedirection = useCallback(() => {
        if (!accessToken) {
            setCheckLogin(true);
        } else {
            setDirection("loyalty")
            router.push(`/${customLink}/loyalty`)
        }
    }, [accessToken, setDirection, setCheckLogin, customLink]);

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
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "backInOut",
                    }}
                    style={{
                        background: "var(--shine-effect)",
                    }}
                />
                <div className="flex items-center justify-between">
                    {showBack && (
                        <MenuItem
                            icon={PiArrowBendUpLeftBold}
                            isSelected={false}
                            label="Back"
                            onClick={() => router.back()}
                        />
                    )}
                    <MenuItem
                        icon={RiCouponLine}
                        label="Rewards"
                        isSelected={selectedBtn === "rewards"}
                        onClick={handleRedirection}
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

                    {!showBack && (
                        <MenuItem
                            icon={MdMenuBook}
                            label="Catalogue"
                            href={`/${customLink}/category?${tableName ? `tableName=${tableName}` : ""}`}
                            isSelected={selectedBtn === "menu" || selectedBtn === "catalogue"}
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
