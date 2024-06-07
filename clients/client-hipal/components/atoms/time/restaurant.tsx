import { _useAllBusiness } from "@components/store/useAllBusiness"
import { memo } from "react"
import { FiClock } from "react-icons/fi"
import OnImgButton from "../buttons/onImgButton"

function RestaurantTime(props: object) {
	const data = _useAllBusiness((s) => s.data)

	return (
		<div>
			{" "}
			{data?.settings?.explore?.openFrom && data?.settings?.explore?.openTill && (
				<div>
					<OnImgButton {...props}>
						<div className="flex flex-row space-x-2">
							<FiClock className="my-auto " />
							<div className="my-auto">
								{data?.settings?.explore?.openFrom}
								{data?.settings?.explore?.openFrom && data?.settings?.explore?.openTill && " - "}
								{data?.settings?.explore?.openTill}
							</div>
						</div>
					</OnImgButton>
				</div>
			)}
		</div>
	)
}

export default memo(RestaurantTime)
