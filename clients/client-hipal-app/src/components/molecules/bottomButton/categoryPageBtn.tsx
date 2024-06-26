"use client";
import { memo, useCallback, useState } from "react";
import BottomButton from ".";
import { useRouter } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import AddAmountModal from "./addAmountModal";
import CallTheWaiterComponent from "./callTheWaiter";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useTableData from "@/components/store/useTableData";

const CategoryPageBtn = memo(() => {
	const isLogin = useLogin((s) => s.isLogin);
	const businessId = useBusinessDetails((s) => s.businessDetails?._id)
	const customLink = useBusinessDetails((s) => s.businessDetails?.customLink)
	const tableName = useTableData((s) => s.tableName)
	const [inputModal, setInputModal] = useState(false);
	const setDirection = useLogin((s) => s.setDirection);
	const router = useRouter();
	const [callWaiterModal, setCallWaiterModal] = useState(false);

	const closeModal = useCallback(() => {
		setInputModal(false);
		setCallWaiterModal(false);
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
		if (!tableName) {
			return router.push(`/scan`);
		}
		setDirection('payment');
		if (!isLogin) {
			return router.push(`/r/${customLink}/user/signup`);
			
		} else {
			openModal()
		}
	}, [setDirection, isLogin, businessId, router]);

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
	}, [setDirection, isLogin, businessId, router]);

	return (
		<>
			<BottomButton>
				<section className="flex items-center justify-between gap-4">
					<button onClick={triggerCallWaiter} className="w-full px-2 py-3 text-sm border rounded-full border-primary">
						{!isLogin ? 'Login to Call Captain' : !tableName ? 'Scan to Call Captain' : 'Call captain'}
					</button>
					<button onClick={proceedToPayment} className="w-full px-2 py-3 text-sm rounded-full bg-primary text-base-100">
						{!isLogin ? 'Login to Pay' : !tableName ? 'Scan to Pay' : 'Pay bill'}
					</button>
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