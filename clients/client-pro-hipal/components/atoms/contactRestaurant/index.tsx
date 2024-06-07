import { _useAllBusiness } from '@components/store/useAllBusiness'
import { memo, useMemo } from 'react'
import { FiPhone } from 'react-icons/fi'
import OnImgButton from '../buttons/onImgButton'

function ContactRestaurant(
	props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) {
	const data = _useAllBusiness((s) => s.data)
	const phoneNumber = useMemo(() => data?.settings?.explore?.phone || '', [data])

	const OnImgButtonProps = {
		onClick: () => {
			if (typeof window !== 'undefined') {
				window.open(`tel:${phoneNumber}`)
			}
		},
	}

	return (
		<div {...props}>
			{phoneNumber && (
				<OnImgButton appendClassNames='btn-circle ' {...OnImgButtonProps}>
					<FiPhone className='my-auto' />
				</OnImgButton>
			)}
		</div>
	)
}

export default memo(ContactRestaurant)
