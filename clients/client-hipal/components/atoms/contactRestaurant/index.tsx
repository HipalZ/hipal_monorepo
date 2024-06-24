import { _useAllBusiness } from "@components/store/useAllBusiness"
import { memo, useMemo } from "react"
import { FiPhone } from "react-icons/fi"
import OnImgButton from "../buttons/onImgButton"

function ContactRestaurant(props: object) {
	const data = _useAllBusiness((s) => s.data)
	const phoneNumber = useMemo(() => data?.settings?.explore?.phone || "", [data])

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

export default memo(ContactRestaurant)
