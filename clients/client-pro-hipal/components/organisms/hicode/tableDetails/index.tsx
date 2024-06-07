import Prompt from '@components/molecules/prompt'
import useIdDetails from '@components/store/useIdDetails'
import { useLogin } from '@components/store/useLogin'
import { useStatus } from '@components/store/useStatus'
import { useRouter } from 'next/router'
import { HiOutlineShare } from 'react-icons/hi'

function TableDetails({ isOpen, onModalClose }) {
	const { dishStatus } = useStatus()
	const { hiCode } = useLogin()
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }
	const { tableId, tableName, zoneId } = useIdDetails()
	const grouped_customers = dishStatus.flat().reduce((acc, customer) => {
		const { customerPhone, customerName } = customer
		const existingCustomer = acc[customerPhone]

		if (customerName) {
			if (existingCustomer) {
				if (!existingCustomer.customerNames.includes(customerName)) {
					existingCustomer.customerNames = customerName
				}
			} else {
				acc[customerPhone] = { customerPhone, customerNames: customerName }
			}
		}

		return acc
	}, {})

	const handleOnClick = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: 'Share Link',
					url: `https://pro.hipal.life/r/${businessId}/explore?tableId=${tableId}&name=${tableName}&zoneId=${zoneId}`,
				})
			} catch (error) {
				console.error('Error sharing link:', error)
			}
		} else {
			console.log('Web Share API not supported')
		}
	}
	return (
		<Prompt
			id='my-modal-5'
			heading={
				<div>
					<div className='flex justify-center tracking-[0.5rem] ml-[2rem] text-base-content font-[700] mt-[1rem] text-[1.9rem] leading-7 text-center mb-[1.7rem]'>
						{hiCode}
						<HiOutlineShare onClick={handleOnClick} className='ml-2 text-primary' />
					</div>
				</div>
			}
			subheading=''
			reduceMarginTop={true}
			isOpen={isOpen}
			onClose={onModalClose}
		>
			<div
				onClick={() => onModalClose(false)}
				className='text-base-content capitalize text-[1.25rem] mx-6 font-bold leading-[1.5rem] mb-[1rem]'
			>
				Hi-Pals
			</div>
			<div className='relative'>
				{Object.values(grouped_customers).map((person: any, index) => (
					<div key={index} className='relative flex mx-6 mb-4'>
						<div className='border capitalize text-center font-bold pt-2 border-base-content rounded-full bg-base-100 w-[2.5rem] h-[2.5rem]'>
							{person?.customerNames?.[0]}
						</div>
						<div className='text-base-content/80 capitalize text-[1rem] font-[550] leading-[1.125rem] ml-4 mt-[0.825rem]'>
							{person?.customerNames}
						</div>
					</div>
				))}

				{dishStatus.length !== 0 && (
					<div className='absolute top-0 mt-1 right-4'>
						<button
							type='button'
							className='bg-transparent Capitalize text-primary font-medium py-1 px-2 border border-primary rounded-[0.5rem]'
						>
							Admin
						</button>
					</div>
				)}
			</div>
		</Prompt>
	)
}

export default TableDetails
