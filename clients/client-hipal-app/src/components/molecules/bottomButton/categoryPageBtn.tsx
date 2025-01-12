"use client";
import Link from "next/link";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { BsHandIndexThumb } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { GiCookingPot } from "react-icons/gi";
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
import { useAuthTableUser } from "../../hooks/usePayments";
import HiCodeValidate from "@/components/organisms/cart/hicodeValidate";
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription";

const MemoCategoryPageBtn = () => {
  const accessToken = useUserToken.getState().accessToken;
  const { userDetails } = useLogin()
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const { isSearchActive, setIsSearchActive, setShowHeader } =
    useSearch();
  const { authTableUser } = useAuthTableUser()
  const customLink = useParams()?.businessId as string;
  const tableName = useTableData((s) => s.tableName);
  const setDirection = useLogin((s) => s.setDirection);
  const setIsPayment = useLogin((s) => s.setIsPayment);
  const router = useRouter();
  const { setCheckLogin } = usePaymentStore();
  const {
    inputModal,
    setInputModal,
    callWaiterModal,
    setCallWaiterModal,
    orderPlaced,
    setOrderPlaced,
    hiCodePopupBeforeBill, setHiCodePopupBeforeBill,
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

  const promptHiCode = useCallback(() => {
    setDirection("category");
    if (!accessToken && !userDetails?._id) {
      setCheckLogin(true);
      return;
    }
    if (outletInfo?.isPosEnabled) {
      authTableUser()
      return;
    }
  }, [setDirection, accessToken, setCheckLogin, outletInfo?.isPosEnabled, authTableUser, userDetails?._id]);

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
                <TimeBadge onClick={promptHiCode} />
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      ) : (
        <BottomButton selected={"catalogue"} showBack />
      )}
      {
        hiCodePopupBeforeBill && (
          <ItemDescriptionPopup show={hiCodePopupBeforeBill} onClose={() => setHiCodePopupBeforeBill(false)}>
            <HiCodeValidate placeOrder={() => { }} isOpenMyOrders={true} />
          </ItemDescriptionPopup>
        )
      }
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
          height="50dvh"
          show={openInstructionModal}
          onClose={() => setOpenInstructionModal(false)}
        >
          <div className="p-6 pb-8 overflow-y-auto">
            {/* Header */}
            <header className="flex items-center gap-2 mb-4">
              <GiCookingPot className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl text-black font-semibold">Cooking Instructions</h2>
            </header>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              Add any special cooking instructions, like less spicy, extra cheese, or no onions.
            </p>

            {/* Textarea Container */}
            <div className="relative mb-8">
              <textarea
                value={tempInstruction}
                onChange={handleInstructionText}
                maxLength={100}
                placeholder="Enter your cooking instructions here..."
                className="w-full min-h-[120px] p-4 text-base text-black bg-white rounded-lg border border-gray-200 
                     focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500
                     placeholder:text-gray-400 resize-none"
                aria-label="Cooking instructions"
              />
              <span className="absolute right-3 bottom-3 text-sm text-gray-400">
                {tempInstruction.length || 0}/{100}
              </span>
            </div>

            {/* Save Button */}
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
          </div>
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