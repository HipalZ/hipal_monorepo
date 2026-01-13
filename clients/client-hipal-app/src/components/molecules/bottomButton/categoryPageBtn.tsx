"use client";
import Link from "next/link";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { BsHandIndexThumb } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiArrowBendUpLeftBold } from "react-icons/pi";
import { useCart } from "@/components/store/useCart";
import { useCartStore } from "@/components/store/useCartStore";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter } from "next/navigation";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useSearch } from "@/components/store/useSearch";
import { useUserToken } from "@hi/common/src/useUserToken";
import AddAmountModal from "./addAmountModal";
import BottomButton from ".";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import CallTheWaiterComponent from "./callTheWaiter";
import OrderPlaced from "@/components/organisms/cart/orderPlaced";
import TimeBadge from "./test";
import useTableData from "@/components/store/useTableData";
import { useAuthTableUser } from "../../hooks/usePayments";
import HiCodeValidate from "@/components/organisms/cart/hicodeValidate";
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription";
import { cn } from "@/components/utils/helpers";
import type { IMenuLayout } from "@/components/types/businessData";
import InstructionPopup from "@/components/hotels/room/InstructionPopup";

interface CategoryPageBtnProps {
  menuLayout: IMenuLayout;
}

const MemoCategoryPageBtn = ({ menuLayout }: CategoryPageBtnProps) => {
  const accessToken = useUserToken.getState().accessToken;
  const { userDetails } = useLogin();
  const primaryColor = menuLayout?.primaryColor || "#ec4899";
  const secondaryColor = menuLayout?.secondaryColor || "#fce7f3";
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const { isSearchActive, setIsSearchActive, setShowHeader } = useSearch();
  const { authTableUser } = useAuthTableUser();
  const customLink = useParams()?.businessId as string;
  const tableName = useTableData((s) => s.tableName);
  const setDirection = useLogin((s) => s.setDirection);
  const setIsPayment = useLogin((s) => s.setIsPayment);
  const router = useRouter();
  const { setCheckLogin } = usePaymentStore();
  const inputModal = useCart((s) => s.inputModal);
  const callWaiterModal = useCart((s) => s.callWaiterModal);
  const orderPlaced = useCart((s) => s.orderPlaced);
  const hiCodePopupBeforeBill = useCart((s) => s.hiCodePopupBeforeBill);
  const setHiCodePopupBeforeBill = useCart((s) => s.setHiCodePopupBeforeBill);
  const setInputModal = useCart((s) => s.setInputModal);
  const setCallWaiterModal = useCart((s) => s.setCallWaiterModal);
  const setOrderPlaced = useCart((s) => s.setOrderPlaced);

  const openInstructionModal = useCartStore((s) => s.openInstructionModal);

  const closeModal = useCallback(() => {
    setInputModal(false);
    setIsPayment(false);
  }, [setIsPayment, setInputModal]);

  const openCallWaiterModal = useCallback(() => {
    setCallWaiterModal(true);
  }, [setCallWaiterModal]);

  const closeCallWaiterModal = useCallback(() => {
    setCallWaiterModal(false);
  }, [setCallWaiterModal]);

  const promptHiCode = useCallback(() => {
    setDirection("category");
    if (!accessToken && !userDetails?._id) {
      setCheckLogin(true);
      return;
    }
    if (outletInfo?.isPosEnabled) {
      authTableUser();
      return;
    }
    setInputModal(true);
  }, [
    setDirection,
    accessToken,
    setCheckLogin,
    outletInfo?.isPosEnabled,
    authTableUser,
    userDetails?._id,
    setInputModal,
  ]);

  const triggerCallWaiter = useCallback(() => {
    setDirection("category");
    if (!tableName) {
      return router.push(`/${customLink}/scan`);
    }
    if (!accessToken) {
      setCheckLogin(true);
      return;
    }
    openCallWaiterModal();
  }, [
    setDirection,
    accessToken,
    router,
    customLink,
    tableName,
    openCallWaiterModal,
    setCheckLogin,
  ]);

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
      {outletInfo?.outLetType !== "OTHER" ? (
        <AnimatePresence>
          {!isSearchActive && (
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="px-2 sticky z-50 bottom-0 w-full max-w-[30rem] bg-[#FCFCFC] overflow-hidden py-2 text-black flex gap-2 justify-evenly"
              style={{
                backgroundColor: secondaryColor,
                color: primaryColor,
              }}
            >
              {/* Explore Button */}
              <motion.div variants={itemVariants}>
                <Link href={`/${customLink}/explore`} className="">
                  <motion.section
                    className="p-2 border rounded-md"
                    style={{ borderColor: primaryColor }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PiArrowBendUpLeftBold size={24} />
                  </motion.section>
                </Link>
              </motion.div>

              {/* Search Button */}
              <motion.div
                variants={itemVariants}
                style={{ borderColor: primaryColor }}
                className={cn(
                  tableName?.length === 0
                    ? "w-full "
                    : "gap-1 flex items-center",
                  "border border-[#B0B0B0] p-2 rounded-md",
                )}
              >
                <motion.button
                  type="button"
                  onClick={openSearchModal}
                  className={cn(
                    tableName?.length === 0
                      ? "w-full flex justify-center items-center"
                      : "flex items-center",
                    "text-sm gap-1",
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSearch size={24} />{" "}
                  <span className="text-base">
                    {tableName?.length === 0 ? "Search" : ""}
                  </span>
                </motion.button>
              </motion.div>
              {/* Call Captain Button */}
              <motion.div
                variants={itemVariants}
                style={{ borderColor: primaryColor }}
                className={cn(
                  tableName?.length === 0
                    ? "hidden"
                    : "gap-1 flex items-center",
                  "border border-[#B0B0B0] p-2 rounded-md",
                )}
              >
                <motion.button
                  type="button"
                  onClick={triggerCallWaiter}
                  className={cn(
                    tableName?.length === 0
                      ? "w-full flex justify-center items-center"
                      : "flex items-center",
                    "text-sm gap-1",
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BsHandIndexThumb size={24} />
                  <span className="text-sm">Call Captain</span>
                </motion.button>
              </motion.div>

              {/* TimeBadge */}
              {tableName?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <TimeBadge onClick={promptHiCode} />
                </motion.div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      ) : (
        <BottomButton selected={"catalogue"} showBack />
      )}
      {hiCodePopupBeforeBill && (
        <ItemDescriptionPopup
          show={hiCodePopupBeforeBill}
          onClose={() => setHiCodePopupBeforeBill(false)}
        >
          <HiCodeValidate isOpenMyOrders={true} />
        </ItemDescriptionPopup>
      )}
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
              <AddAmountModal />
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
      <AnimatePresence>
        {callWaiterModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <BottomPopUp
              show={callWaiterModal}
              onClose={closeCallWaiterModal}
              hide
              height="100dvh"
            >
              <CallTheWaiterComponent onClose={closeCallWaiterModal} />
            </BottomPopUp>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const CategoryPageBtn = memo(MemoCategoryPageBtn);
export default CategoryPageBtn;
