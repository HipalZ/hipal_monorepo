"use client";
import { memo, useCallback, useState } from "react";
import BottomButton from ".";
import { useParams, useRouter } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import AddAmountModal from "./addAmountModal";
import useTableData from "@/components/store/useTableData";
import axios from "@/utils/axios";
import { toast } from "react-toastify";

const messages = [
	"Bring Water bottles",
	"Bring Menu",
	"Bring Tissue Paper",
	"Please settle my table",
];

const CategoryPageBtn = memo(() =>{
	const isLogin = useLogin((s) => s.isLogin);
	const params = useParams();
	const [inputModal, setInputModal] = useState(false);
	const businessId = params?.businessId;
	const setDirection = useLogin((s) => s.setDirection);
	const router = useRouter();
	const [callWaiterModal, setCallWaiterModal] = useState(false);
	const [message, setMessage] = useState('');
	const { tableName } = useTableData()

	const callTheWaiter = async () => {
		if(message === '') {
			return toast.error('Please select a message to call waiter')
		}
		try {
			const config = {
				method: 'POST',
				url: '/v1/payments/createWaiterAlert',
				data: {
					businessId: businessId,
					tableName: tableName,
					message: message,
					alertType: 'WAITER',
					status: 'WAITER'
				}
			}
			const response = await axios(config)
			if (response.status === 200) {
				toast.success('Waiter will be there soon Thank you!!')
				setCallWaiterModal(false);
			}
		} catch (err) {
			console.log(err);
			const errors = err.response?.data?.errors;
			if (errors && Array.isArray(errors)) {
				errors.forEach((error: { message: string }) => {
					console.log(error.message);
					toast.error('Please Scan the table to call waiter')
				});
			}
		}
	}

	const handleSelectMessage = useCallback((message: string) => {
		setMessage(message);
	}, []);

	const closeModal = useCallback(() => {
		setInputModal(false);
		setCallWaiterModal(false);
	}
		, [setInputModal]);
	const openModal = useCallback(() => {
		setInputModal(true);
	}
		, [setInputModal]);

	const proceedToPayment = useCallback(() => {
		setDirection('payment');
		if (!isLogin) {
			router.push(`/r/${businessId}/user/signup`);
		} else {
			openModal()
		}
	}, [setDirection, isLogin, businessId, router]);

	const triggerCallWaiter = useCallback(() => {
		setDirection('category');
		if (!isLogin) {
			router.push(`/r/${businessId}/user/signup`);
		} else {
			// openModal()
			setCallWaiterModal(true);
		}
	}, [setDirection, isLogin, businessId, router]);

	return (
		<>
			<BottomButton>
				{isLogin ? (
					<section className="flex items-center justify-between gap-4">
						<button onClick={triggerCallWaiter} className="w-full px-2 py-3 text-sm border rounded-full border-primary">
							Call Waiter
						</button>
						<button onClick={proceedToPayment} className="w-full px-2 py-3 text-sm rounded-full bg-primary text-base-100">
							Pay Bill
						</button>
					</section>
				) : (
						<section className="flex items-center justify-between gap-4">
							<button onClick={triggerCallWaiter} className="w-full px-2 py-3 text-sm border rounded-full border-primary">
								Scan to Call Waiter
						</button>
							<button onClick={proceedToPayment} className="w-full px-2 py-3 text-sm rounded-full bg-primary text-base-100">
								Scan to Pay
						</button>
						</section>
					)}
			</BottomButton>
			{inputModal &&
				<BottomPopUp show={inputModal} onClose={closeModal}>
					<AddAmountModal />
				</BottomPopUp>
			}
			{
				<BottomPopUp show={callWaiterModal} onClose={closeModal}>
					<ul className="h-full overflow-auto">
						{messages.map((message, index) => (
							<li
								className="m-4 p-2 cursor-pointer rounded-md transition-colors duration-200 ease-in-out hover:bg-primary hover:text-base-100 hover:scale-105 transform"
								key={index}
								onClick={() => handleSelectMessage(message)}
							>
								{message}
							</li>
						))}
					</ul>
					<div onClick={callTheWaiter} className="mb-4 flex justify-center">
						<button className="on_active_bounce bg-primary text-base-100 z-50 mx-6 w-[90vw] max-w-md rounded-full py-[1rem] text-[18px] font-[600] leading-[1.15rem] transition-transform duration-150 ease-in-out hover:scale-105">
							Save
    </button>
					</div>
				</BottomPopUp>
			}
		</>
	);
})

export default CategoryPageBtn