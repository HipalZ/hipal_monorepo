"use client";
import Link from "next/link";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { BsHandIndexThumb } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { GiCampCookingPot } from "react-icons/gi";
import { memo, useCallback, useState } from "react";
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
import CommonBottomButton from "@/components/atoms/bottomButton";
import OrderPlaced from "@/components/organisms/cart/orderPlaced";
import TimeBadge from "./test";
import useTableData from "@/components/store/useTableData";

const MemoCategoryPageBtn = () => {
  const accessToken = useUserToken.getState().accessToken;

  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const { isSearchActive, setIsSearchActive, showHeader, setShowHeader } =
    useSearch();
  const customLink = useParams()?.businessId as string;
  const tableName = useTableData((s) => s.tableName);
  const setDirection = useLogin((s) => s.setDirection);
  const setIsPayment = useLogin((s) => s.setIsPayment);
  const router = useRouter();
  const { setCheckLogin } = usePaymentStore();
  const {
    showCart,
    setShowCart,
    inputModal,
    setInputModal,
    callWaiterModal,
    setCallWaiterModal,
    setCartPage,
    orderPlaced,
    setOrderPlaced,
  } = useCart();
  const [tempInstruction, setTempInstruction] = useState("");
  const {
    setOpenInstructionModal,
    openInstructionModal,
    setInstruction,
    addInstructionToDish,
  } = useCartStore();

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

  const proceedToPayment = useCallback(() => {
    setDirection("category");
    if (!accessToken) {
      setCheckLogin(true);
      return;
    }
    if (outletInfo?.isPosEnabled) {
      setShowCart(!showCart);
      setCartPage("order");
      return;
    }
    setInputModal(true);
  }, [
    setDirection,
    accessToken,
    showCart,
    setInputModal,
    outletInfo?.isPosEnabled,
    setCheckLogin,
    setShowCart,
    setCartPage,
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

  const handleInstructionText = useCallback(
    (e) => {
      setTempInstruction(e.target.value);
    },
    []
  );

  const handleSaveInstruction = useCallback(() => {
    addInstructionToDish(tempInstruction);
    setInstruction(tempInstruction);
    setOpenInstructionModal(false);
  }, [
    addInstructionToDish,
    setOpenInstructionModal,
    tempInstruction,
    setInstruction,
  ]);

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
              className="px-2 sticky z-50 bottom-0 w-full 
             max-w-[30rem] bg-[#FCFCFC] shadow-lg
            overflow-hidden py-4 text-black flex gap-2 justify-evenly"
              style={{ boxShadow: "4px 4px 4px 4px #00000040" }}
            >
              <motion.div variants={itemVariants}>
                <Link href={`/${customLink}/explore`} className="">
                  <motion.section
                    className="border border-[#B0B0B0] p-2 rounded-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PiArrowBendUpLeftBold size={24} />
                  </motion.section>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <motion.button
                  type="button"
                  onClick={openSearchModal}
                  className="border border-[#B0B0B0] p-2 rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSearch size={24} />
                </motion.button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <motion.button
                  type="button"
                  onClick={triggerCallWaiter}
                  className="border border-[#B0B0B0] p-2 rounded-md gap-1 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BsHandIndexThumb size={24} />
                  <span className="text-sm">Call Captain</span>
                </motion.button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <TimeBadge onClick={proceedToPayment} />
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      ) : (
        <BottomButton selected={"catalogue"} showBack />
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

      {openInstructionModal && (
        <BottomPopUp
          height="40dvh"
          show={openInstructionModal}
          onClose={() => setOpenInstructionModal(false)}
        >
          <article className="text-black m-4 overflow-y-auto">
            <h1 className="text-lg font-semibold inline-flex gap-1 items-center text-orange-500 mb-2">
              <GiCampCookingPot size={20} /> <span className="text-black font-semibold">Cooking Instructions</span>
            </h1>
            <p className="text-sm text-black mb-4">
              Add any special cooking instructions, like less spicy, extra cheese, or no onions.
            </p>
            <article className="relative">
              <textarea
                placeholder="Enter your cooking instructions here..."
                value={tempInstruction}
                onChange={handleInstructionText}
                maxLength={100}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={3}
              />
              <p className="absolute right-4 bottom-4 text-xs mt-1">
                {tempInstruction.length || 0}/100
              </p>
            </article>
            <CommonBottomButton
              buttons={[
                {
                  text: "Save Instruction",
                  onClick: handleSaveInstruction,
                  type: "button",
                  highlight: true,
                },
              ]}
            />
          </article>
        </BottomPopUp>
      )}
      <AnimatePresence>
        {orderPlaced && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <BottomPopUp
              show={orderPlaced}
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
              bottomCross
              hide
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