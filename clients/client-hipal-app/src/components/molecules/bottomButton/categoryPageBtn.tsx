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

const CategoryPageBtn = memo(() => {
	const { isLogin, isPayment, direction } = useLogin();
	const businessId = useBusinessDetails((s) => s.businessDetails?._id)
	const customLink = useBusinessDetails((s) => s.businessDetails?.customLink)
	const tableName = useTableData((s) => s.tableName)
	const [inputModal, setInputModal] = useState(false);
	const setDirection = useLogin((s) => s.setDirection);
	const setIsPayment = useLogin((s) => s.setIsPayment);
	const router = useRouter();
	const [callWaiterModal, setCallWaiterModal] = useState(false);
	const { setShowCart, showCart } = useCart()

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
		if (!tableName) {
			return router.push(`/scan`);
		}
		if (!isLogin) {
			return router.push(`/r/${customLink}/user/signup`);

		} else {
			openModal()
		}
	}, [setDirection, isLogin, businessId, router]);

	const triggerCallWaiter = useCallback(() => {
		setDirection('category');
		setIsPayment(true);
		if (!tableName) {
			return router.push(`/scan`);
		}
		if (!isLogin) {
			return router.push(`/r/${customLink}/user/signup`);

		} else {
			openCallWaiterModal()
		}
	}, [setDirection, isLogin, businessId, router]);

	const showingCart = useCallback(() => {
		setShowCart(!showCart);
	}, [showCart, setShowCart]);

	useEffect(() => {
		if (isPayment && direction === 'category') {
			openModal()
		}
	}, [])

	return (
		<>
			<BottomButton>
				<section className="relative flex items-center justify-between gap-4">
					<center onClick={triggerCallWaiter} className="w-full px-2 text-sm font-thin text-base-100">
						<FaConciergeBell size={22} className="mr-2" />
						{!isLogin ? 'Login to Call Captain' : !tableName ? 'Scan to Call Captain' : 'Call captain'}
					</center>
					<button onClick={showingCart} className="absolute top-0 p-4 transform -translate-x-1/2 -translate-y-[80%] border rounded-full left-1/2 border-primary bg-base-100">
						<BsBagHeart size={30} />
					</button>
					<small className="w-full -mb-6 font-thin text-base-100">view List</small>
					<center onClick={proceedToPayment} className="w-full px-2 text-sm font-thin text-base-100">
						<FaMoneyBillWave size={22} />
						{!isLogin ? 'Login to Pay' : !tableName ? 'Scan to Pay' : 'Pay bill'}
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