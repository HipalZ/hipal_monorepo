import BottomButton from "@components/molecules/bottomButton"
import { useRouter } from "next/router"
import { memo } from "react"
import Link from "next/link"
import { routePaths } from "@components/utils/routes"

function FinalCartBtn() {
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }
	return (
		<div>
			<Link href={`${routePaths.category(businessId)}`} passHref>
				<BottomButton>
					<div className="flex flex-row space-x-2 capitalize">
						<span className="my-auto">Order More</span>
					</div>
				</BottomButton>
			</Link>
			{/* {businessId?.toLowerCase() === BUSINESS_ID.COFFEE_CUP.toLowerCase() ||
			businessId?.toLowerCase() === BUSINESS_ID.UPDATE_COFFEE_CUP.toLowerCase() ? (
				<Link href={`${routePaths.category(businessId)}`} passHref>
					<BottomButton>
						<div className='flex flex-row space-x-2 capitalize'>
							<span className='my-auto'>Order More</span>
						</div>
					</BottomButton>
				</Link>
			) : (
				<BottomButton onClick={handleMakeOrder}>
					<div className='flex flex-row space-x-2 capitalize'>
						<span className='my-auto'>Make Order</span>
					</div>
				</BottomButton>
			)} */}
		</div>
	)
}

export default memo(FinalCartBtn)
