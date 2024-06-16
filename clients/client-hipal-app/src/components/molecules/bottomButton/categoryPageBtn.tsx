"use client"
import { useCart } from "@/components/store/useCart"
import { getGrandTotalPrice } from "@/components/utils/helpers"
import Link from "next/link"
import { memo } from "react"
import BottomButton from "."
import { useParams } from "next/navigation"
import { useLogin } from "@/components/store/useLogin"

function CategoryPageBtn() {
	const cart = useCart((s) => s.cart)
	const {isLogin} = useLogin();
	const params = useParams();
	const businessId = params?.businessId;
	const proceedToPayment = () =>{
		if(!isLogin) return `/r/${businessId}/user/signup/`
		return `/r/${businessId}/payment`
	}

	return (
		<Link href={`${proceedToPayment()}`} passHref>
			<BottomButton>
				<div className="flex flex-row capitalize space-x-36">
					<div className="flex flex-row">
						<span className="my-auto">Proceed to Pay</span>
					</div>
					{Object.keys(cart).length > 0 && (
						<div className="flex-col">
							<div>{Object.keys(cart).length && Object.keys(cart).length} items </div>
							<div>
								<span>&#8377;</span> {getGrandTotalPrice(cart)}
							</div>
						</div>
					)}
				</div>
			</BottomButton>
		</Link>
	)
}

export default memo(CategoryPageBtn)
