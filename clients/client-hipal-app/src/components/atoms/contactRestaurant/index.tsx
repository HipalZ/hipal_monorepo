import { memo } from "react"
import { FiPhone } from "react-icons/fi"
import OnImgButton from "../buttons/onImgButton"

interface IProps {
	phoneNumber: string
}
function ContactRestaurant(props: IProps) {
	const {phoneNumber} = props;
	const OnImgButtonProps = {
		onClick: () => {
			if (typeof window !== "undefined") {
				window.open(`tel:${phoneNumber}`)
			}
		},
	}

	return (
		<div>
			{phoneNumber && (
				<OnImgButton
					appendClassNames="btn-circle"
					aria-label="Contact Restaurant"
					{...props}
					{...OnImgButtonProps}
				>
					<FiPhone className="my-auto" />
				</OnImgButton>
			)}
		</div>
	)
}
ContactRestaurant.displayName = "ContactRestaurant";
export default memo(ContactRestaurant)
