import { _useAllBusiness } from "@/components/store/useAllBusiness"
import { memo, useMemo } from "react"
import { HiOutlineLocationMarker } from "react-icons/hi"
import OnImgButton from "../buttons/onImgButton"

interface IProps {
	location: string
}
export default memo(function RestaurantLocation(props:IProps) {
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
})
