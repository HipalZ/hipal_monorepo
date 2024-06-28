"use client";
import { memo, useCallback, useEffect, useState } from "react";
import BottomButton from ".";
import { useRouter } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import AddAmountModal from "./addAmountModal";
import CallTheWaiterComponent from "./callTheWaiter";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useTableData from "@/components/store/useTableData";
import { FaConciergeBell, FaMoneyBillWave } from "react-icons/fa";
import { BsBagHeart } from "react-icons/bs";
import { useCart } from "@/components/store/useCart";
import { HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const CategoryPageBtn = memo(() => {
	const { isLogin, isPayment } = useLogin();
	const businessId = useBusinessDetails((s) => s.businessDetails?._id)
	const customLink = useBusinessDetails((s) => s.businessDetails?.customLink)
	const tableName = useTableData((s) => s.tableName)
	const [inputModal, setInputModal] = useState(false);
	const setDirection = useLogin((s) => s.setDirection);
	const setIsPayment = useLogin((s) => s.setIsPayment);
	const router = useRouter();
	const [callWaiterModal, setCallWaiterModal] = useState(false);
	const { setShowCart, showCart ,cart} = useCart()

	const closeModal = useCallback(() => {
		setInputModal(false);
		setIsPayment(false)
	}, [setInputModal]);

	const openModal = useCallback(() => {
		setInputModal(true);
	}, [setInputModal]);

	const openCallWaiterModal = useCallback(() => {
		setCallWaiterModal(true);
	}, [setCallWaiterModal]);

	const closeCallWaiterModal = useCallback(() => {
		setCallWaiterModal(false);
	}, [setCallWaiterModal]);

	const proceedToPayment = useCallback(() => {
		setDirection('category');
		setIsPayment(true)
		if (!tableName) {
			return router.push(`/scan`);
		}
		if (!isLogin) { 
			return router.push(`/r/${customLink}/user/signup`);

		} else {
			openModal()
		}
	}, [setDirection, isLogin, businessId, router,customLink]);

	const triggerCallWaiter = useCallback(() => {
		setDirection('category');
		if (!tableName) {
			return router.push(`/scan`);
		}
		if (!isLogin) {
			return router.push(`/r/${customLink}/user/signup`);

		} else {
			openCallWaiterModal()
		}
	}, [setDirection, isLogin, businessId, router,customLink]);

	const showingCart = useCallback(() => {
		setShowCart(!showCart);
	}, [showCart, setShowCart]);

	useEffect(() => {
		if (isPayment && isLogin && tableName) {
			openModal()
		}
	}, [])

	return (
		<>
			<BottomButton>
				<section className="relative flex items-center justify-between gap-4">
					<center onClick={triggerCallWaiter} className="w-full px-2 font-light text-base-100">
						<FaConciergeBell size={22} className="mr-2" />
						Call captain
					</center>
					<button
						onClick={showingCart}
						className="absolute top-0 p-4 transform -translate-x-1/2 -translate-y-[80%] border rounded-full left-1/2 border-primary bg-base-100"
					>
						<AnimatePresence initial={false} mode='wait'>
                            {showCart ? (
                                <motion.div
                                    key="close"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <HiX size={30} className="text-primary" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="bag"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="relative">
                                        <BsBagHeart size={30} />
                                        {Object.values(cart).length > 0 && (
                                            <motion.span
                                                className="absolute right-0 px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full -top-4"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                {Object.values(cart).length}
                                            </motion.span>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
					</button>
					<span className="w-full -mb-5 font-thin text-base-100">{
						showCart ? 'Menu' : 'Cart'
					}</span>
					<center onClick={proceedToPayment} className="w-full px-2 font-light text-base-100">
						<FaMoneyBillWave size={22} />
					Pay bill
					</center>
				</section>
			</BottomButton>

			{inputModal &&
				<BottomPopUp show={inputModal} onClose={closeModal}>
					<AddAmountModal />
				</BottomPopUp>
			}

			{callWaiterModal &&
				<BottomPopUp show={callWaiterModal} onClose={closeCallWaiterModal}>
					<CallTheWaiterComponent onClose={closeCallWaiterModal} />
				</BottomPopUp>
			}
		</>
	);
})

export default CategoryPageBtn