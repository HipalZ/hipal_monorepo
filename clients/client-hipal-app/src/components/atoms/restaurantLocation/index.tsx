import { _useAllBusiness } from "@/components/store/useAllBusiness"
import { memo } from "react"
import { HiOutlineLocationMarker } from "react-icons/hi"
import OnImgButton from "../buttons/onImgButton"

interface IProps {
	location: string
}

function RestaurantLocation(props:IProps) {
	const {location} = props
	const OnImgButtonProps = {
		onClick: () => {
			if (typeof window !== "undefined") {
				window.location.href = location
			}
		},
	}

	return (
		<div>
			{location && (
				<OnImgButton
					appendClassNames="btn-circle"
					aria-label="Restaurant Location"
					{...props}
					{...OnImgButtonProps}
				>
					<HiOutlineLocationMarker className="my-auto text-lg " />
				</OnImgButton>
			)}
		</div>
	)
}

const MemoRestaurantLocation = memo(RestaurantLocation)
export default MemoRestaurantLocation