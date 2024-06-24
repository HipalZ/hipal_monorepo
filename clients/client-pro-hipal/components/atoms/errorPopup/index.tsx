import React from 'react'
import { BiErrorAlt } from 'react-icons/bi'
import Popup from '../Popup'
import Link from 'next/link'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import { useRouter } from 'next/router'

const ErrorPopup = ({ show, onClose, title, message, buttonText }) => {
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }

	return (
		<Popup show={show} onClose={onClose}>
			<div className='pt-4 pb-8 mx-12 text-base-content bg-base-100 rounded-xl'>
				<div className='flex justify-center text-3xl text-primary'>
					<BiErrorAlt />
				</div>
				<div className='mx-6 mt-4 font-semibold text-center'>{title}</div>
				<div className='flex justify-center mt-4 text-[0.75rem] font-light'>{message}</div>
				<div className='flex justify-center mx-[1rem] mt-4 font-medium'>
					<Link href='/scan'>
						<button className='px-8 py-1 rounded-full shadow-lg btn btn-primary shadow-base-200'>
							{buttonText}
						</button>
					</Link>
				</div>
			</div>
		</Popup>
	)
}

export default ErrorPopup
