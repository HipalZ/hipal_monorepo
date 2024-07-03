import BottomButton from "@/components/molecules/bottomButton"
import { memo } from "react"
import Link from "next/link"
import { routePaths } from "@/components/utils/routes"
import { useParams } from "next/navigation"

const FinalCartBtn = ()=> {
	const params = useParams()
	const { businessId } = params as { businessId: string }
	return (
		<div>
			<Link href={`${routePaths.category(businessId)}`} passHref>
				<BottomButton>
					<div className="flex flex-row space-x-2 capitalize">
						<span className="my-auto">Order More</span>
					</div>
				</BottomButton>
			</Link>
		</div>
	)
}

const MemoFinalCartBtn = memo(FinalCartBtn)
export default MemoFinalCartBtn
