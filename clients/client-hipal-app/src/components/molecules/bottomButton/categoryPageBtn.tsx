"use client";
import { memo, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";
import AddAmountModal from "./addAmountModal";
import CallTheWaiterComponent from "./callTheWaiter";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useTableData from "@/components/store/useTableData";
import { useCart } from "@/components/store/useCart";
import { useSearch } from "@/components/store/useSearch";
import { useUserToken } from "@hi/common/src/useUserToken";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { MdReceiptLong } from "react-icons/md";
import { BsHandIndexThumb } from "react-icons/bs";
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription";
import { PiArrowBendUpLeftBold } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";

const MemoCategoryPageBtn = () => {
  const accessToken = useUserToken.getState().accessToken;
  const { businessId } = useBusinessDetails((s) => ({
    businessId: s.businessDetails?._id,
  }));
  const { isSearchActive, setIsSearchActive, showHeader, setShowHeader } =
    useSearch();
  const customLink = useParams()?.businessId as string;
  const tableName = useTableData((s) => s.tableName);
  const setDirection = useLogin((s) => s.setDirection);
  const setIsPayment = useLogin((s) => s.setIsPayment);
  const router = useRouter();
  const [callWaiterModal, setCallWaiterModal] = useState(false);
  const { setShowCart, showCart, setCartPage, inputModal, setInputModal } =
    useCart();

  const closeModal = useCallback(() => {
    setInputModal(false);
    setIsPayment(false);
  }, [setIsPayment]);

  const openCallWaiterModal = useCallback(() => {
    setCallWaiterModal(true);
  }, []);

  const closeCallWaiterModal = useCallback(() => {
    setCallWaiterModal(false);
  }, []);

  const proceedToPayment = useCallback(() => {
    if (!accessToken) {
      router.push(`/${customLink}/user/signup`);
    }
    setCartPage("order");
    setShowCart(true);
  }, [setDirection, accessToken, customLink, showCart]);

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
  const openSearchModal = useCallback(() => {
    setIsSearchActive(true);
    setShowHeader(true);
  }, [showHeader, isSearchActive]);

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
            className="px-2 fixed z-50 bottom-0 w-full 
             max-w-[30rem] bg-[#FCFCFC] shadow-lg
            transform md:-translate-x-1/2 md:left-1/2
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
              <motion.button
                type="button"
                onClick={proceedToPayment}
                className="border border-[#B0B0B0] p-2 rounded-md flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MdReceiptLong size={24} />
                <span className="text-sm"> My Orders</span>
              </motion.button>
            </motion.div>
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
            <BottomPopUp show={inputModal} onClose={closeModal} linearGradTheme>
              <AddAmountModal />
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
            <ItemDescriptionPopup
              heading="Help"
              show={callWaiterModal}
              onClose={closeCallWaiterModal}
            >
              <CallTheWaiterComponent onClose={closeCallWaiterModal} />
            </ItemDescriptionPopup>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const CategoryPageBtn = memo(MemoCategoryPageBtn);
export default CategoryPageBtn;
