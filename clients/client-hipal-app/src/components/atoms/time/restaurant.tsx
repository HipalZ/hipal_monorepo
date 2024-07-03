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
		<>
			{openFrom && openTill ? (
				<div>
					<OnImgButton>
						<div className="flex flex-row space-x-2">
							<FiClock className="my-auto " />
							<div className="my-auto">
								{openFrom.slice(0, 9)}
								{openFrom && openFrom && " - "}
								{openTill.slice(0, 9)}
							</div>
						</div>
					</OnImgButton>
				</div>
			):null}
		</>
	)
}

const RestaurantTimeMemo = memo(RestaurantTime)
export default RestaurantTimeMemo
