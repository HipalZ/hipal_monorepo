"use client";
import Link from "next/link";
import { memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/store/useCart";
import { useCartStore } from "@/components/store/useCartStore";
import { useLogin } from "@/components/store/useLogin";
import { useParams } from "next/navigation";
import { useSearch } from "@/components/store/useSearch";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import OrderPlaced from "@/components/organisms/cart/orderPlaced";
import { cn } from "@/components/utils/helpers";
import type { IMenuLayout } from "@/components/types/businessData";
import InstructionPopup from "@/components/hotels/room/InstructionPopup";
import MemoAddAmountModal from "@/components/molecules/bottomButton/addAmountModal";
import { ArrowLeft, CreditCard, Search } from "lucide-react";
import { useUserToken } from "@hi/common/src/useUserToken";
import { usePaymentStore } from "@store/usePaymentStore";

interface JewelleryCategoryPageBtnProps {
  menuLayout: IMenuLayout;
}

const MemoJewelleryCategoryPageBtn = ({
  menuLayout,
}: JewelleryCategoryPageBtnProps) => {
  const primaryColor = menuLayout?.primaryColor || "#641626";
  const secondaryColor = menuLayout?.secondaryColor || "#F9E9C7";
  const { isSearchActive, setIsSearchActive, setShowHeader } = useSearch();
  const customLink = useParams()?.businessId as string;
  const setIsPayment = useLogin((s) => s.setIsPayment);
  const inputModal = useCart((s) => s.inputModal);
  const orderPlaced = useCart((s) => s.orderPlaced);
  const setInputModal = useCart((s) => s.setInputModal);
  const setOrderPlaced = useCart((s) => s.setOrderPlaced);
  const accessToken = useUserToken.getState().accessToken;
  const openInstructionModal = useCartStore((s) => s.openInstructionModal);
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);

  const openModal = useCallback(() => {
    if (!accessToken) {
      setCheckLogin(true);
    }
    setInputModal(true);
    setIsPayment(true);
  }, [setIsPayment, setInputModal, accessToken, setCheckLogin]);

  const closeModal = useCallback(() => {
    setInputModal(false);
    setIsPayment(false);
  }, [setIsPayment, setInputModal]);

  const openSearchModal = useCallback(() => {
    setIsSearchActive(true);
    setShowHeader(true);
  }, [setIsSearchActive, setShowHeader]);

  const containerVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: {
      y: 100,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  };

  return (
    <>
      <AnimatePresence>
        {!isSearchActive && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 mt-6 left-0 right-0  z-50 w-full max-w-[30rem] mx-auto"
            style={{
              background: `linear-gradient(135deg, ${secondaryColor} 0%, ${secondaryColor}f0 100%)`,
            }}
          >
            <div className="backdrop-blur-md bg-white/90 border-t border-gray-200/50 shadow-2xl">
              <div className="px-6 py-2">
                <div className="flex items-center justify-between gap-4">
                  {/* Back Button */}
                  <motion.div variants={itemVariants}>
                    <Link href={`/${customLink}`}>
                      <motion.button
                        className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full",
                          "border-2 transition-all duration-300 hover:shadow-lg",
                        )}
                        style={{
                          borderColor: primaryColor,
                          color: primaryColor,
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: `0 8px 25px ${primaryColor}40`,
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowLeft size={20} />
                      </motion.button>
                    </Link>
                  </motion.div>

                  {/* Search Button */}
                  <motion.div variants={itemVariants} className="flex-1">
                    <motion.button
                      onClick={openSearchModal}
                      className={cn(
                        "w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full",
                        "border-2 transition-all duration-300 font-medium text-sm tracking-wide",
                      )}
                      style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                        backgroundColor: `${primaryColor}08`,
                      }}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: `${primaryColor}15`,
                        boxShadow: `0 8px 25px ${primaryColor}30`,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Search size={18} />
                      <span>Search</span>
                    </motion.button>
                  </motion.div>

                  {/* Pay Button */}
                  <motion.div variants={itemVariants}>
                    <motion.button
                      onClick={openModal}
                      className={cn(
                        "flex items-center justify-center gap-2 px-6 py-3 rounded-full",
                        "font-semibold text-sm tracking-wide transition-all duration-300",
                      )}
                      style={{
                        backgroundColor: primaryColor,
                        color: secondaryColor,
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: `0 12px 30px ${primaryColor}50`,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CreditCard size={18} />
                      <span>Pay</span>
                    </motion.button>
                  </motion.div>
                </div>
              </div>

              <div
                className="h-1 w-16 mx-auto rounded-full opacity-30"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {inputModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <BottomPopUp
              height="85dvh"
              show={inputModal}
              onClose={closeModal}
              linearGradTheme
            >
              <MemoAddAmountModal onClose={closeModal} />
            </BottomPopUp>
          </motion.div>
        )}
      </AnimatePresence>
      {openInstructionModal && <InstructionPopup />}
      <AnimatePresence>
        {orderPlaced && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <BottomPopUp
              show={orderPlaced}
              hide
              onClose={() => setOrderPlaced(false)}
            >
              <OrderPlaced />
            </BottomPopUp>
          </motion.div>
        )}
      </AnimatePresence>
      ;
    </>
  );
};

const JewelleryCategoryPageBtn = memo(MemoJewelleryCategoryPageBtn);
export default JewelleryCategoryPageBtn;
