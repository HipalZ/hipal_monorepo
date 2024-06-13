import { memo } from "react"
import { FiClock } from "react-icons/fi"
import OnImgButton from "../buttons/onImgButton"

interface IProps {
	openFrom : string
	openTill : string
}
function RestaurantTime(props: IProps) {
	const { openFrom, openTill } = props
	return (
		<div>
			{" "}
			{openFrom && openTill && (
				<div>
					<OnImgButton {...props}>
						<div className="flex flex-row space-x-2">
							<FiClock className="my-auto " />
							<div className="my-auto">
								{openFrom}
								{openFrom && openFrom && " - "}
								{openTill}
							</div>
						</div>
					</OnImgButton>
				</div>
			)}
		</div>
	)
}

export default memo(RestaurantTime)
