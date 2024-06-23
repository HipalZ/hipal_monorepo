"use client";
import { memo, useCallback, useState } from "react";
import BottomButton from ".";
import { useParams, useRouter } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import AddAmountModal from "./addAmountModal";

function CategoryPageBtn() {
	const isLogin = useLogin((s) => s.isLogin);
	const params = useParams();
	const [inputModal, setInputModal] = useState(false);
	const businessId = params?.businessId;
	const setDirection = useLogin((s) => s.setDirection);
	const router = useRouter();

	const closeModal = useCallback(() => {
		setInputModal(false);
	}
		, [setInputModal]);
	const openModal = useCallback(() => {
		setInputModal(true);
	}
		, [setInputModal]);

	const proceedToPayment = useCallback(() => {
		setDirection('category');
		if (!isLogin) {
			router.push(`/r/${businessId}/user/signup`);
		} else {
			openModal()
		}
	}, [setDirection, isLogin, businessId, router]);

	return (
		<>
			<BottomButton>
				{isLogin ? (
					<section className="flex items-center justify-between gap-4">
						<button className="w-full px-2 py-3 text-sm border rounded-full border-primary">
							Call Waiter
						</button>
						<button onClick={proceedToPayment} className="w-full px-2 py-3 text-sm rounded-full bg-primary text-base-100">
							Pay Bill
						</button>
					</section>
				) : (
					<section className="flex items-center justify-between gap-4">
						<button className="w-full px-2 py-3 text-sm border rounded-full border-primary">
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
		</>
	);
}

export default memo(CategoryPageBtn);



// {Object.keys(cart).length > 0 && (
// 	<div className="flex-col">
// 	  <div>{Object.keys(cart).length} items</div>
// 	  <div>
// 		<span>&#8377;</span> {getGrandTotalPrice(cart)}
// 	  </div>
// 	</div>
//   )}