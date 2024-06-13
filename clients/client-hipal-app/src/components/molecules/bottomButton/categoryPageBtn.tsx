import { useCart } from "@/components/store/useCart"
import { useRoutingFlow } from "@/components/store/useRoutingFlow"
import { getGrandTotalPrice } from "@/components/utils/helpers"
import Link from "next/link"
import { memo } from "react"
import BottomButton from "."

function CategoryPageBtn() {
	const cart = useCart((s) => s.cart)
	const { getNextPath } = useRoutingFlow()

	return (
		<Link href={`${getNextPath()}`} passHref>
			<BottomButton>
				<div className="flex flex-row capitalize space-x-36">
					<div className="flex flex-row">
						<span className="my-auto">Final cart</span>
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
