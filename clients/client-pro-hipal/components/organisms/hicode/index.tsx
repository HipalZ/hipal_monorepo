import Prompt from '@components/molecules/prompt'
import { useCart } from '@components/store/useCart'
import useIdDetails from '@components/store/useIdDetails'
import { useLogin } from '@components/store/useLogin'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import axios from '@utils/axios'
import { useRouter } from 'next/router'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

function PromptHiCode({ isOpen, onModalClose }) {
	const [hiCode, setHiCode] = useState(['', '', '', ''])
	const [error, setError] = useState('')
	const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]
	const [isHighlight, setIsHighlight] = useState<boolean>(false)
	const setHiCodeZ = useLogin((state) => state.setHiCode)
	const cart = useCart((state) => state.cart)
	const setCart = useCart((s) => s.setCart)
	const { userDetails, errorMsg } = useLogin()
	const { zoneId, tableId, tableName } = useIdDetails()
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }

	const handleHiCodeChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
		const newHiCode = [...hiCode]
		newHiCode[index] = e.target.value

		// Move focus to next input field
		if (index < inputRefs.length - 1 && e.target.value !== '') {
			// @ts-ignore
			inputRefs[index + 1].current?.focus()
		}

		setHiCode(newHiCode)
	}
	const handleOnClick = () => {
		setIsHighlight(true)
	}

	const result = async (fullHiCode) => {
		const config = {
			method: 'POST',
			url: '/v1/kitchens/:id/user/kots',
			data: {
				businessId,
				zoneId,
				tableId,
				tableName,
				customerName: userDetails.name,
				customerPhone: `91${userDetails.phone}`,
				cart,
				hiCode: fullHiCode,
			},
		}
		try {
			const { data } = await axios(config)
			if (data.hiCode) {
				setHiCode(data.hiCode)
			}
			toast.success('Order placed successfully')
			onModalClose()
			setCart({})
			router.push(routePaths[PAGE_TYPES.CATEGORY](businessId))
		} catch (error: any) {
			if (error.response.status === 400) {
				setError(error.response.data.message)
				setHiCode(['', '', '', ''])
				// @ts-ignore
				inputRefs[0].current.focus()
			}
			console.log(error.response.status)
		}
	}

	useEffect(() => {
		const fullHiCode = hiCode.join('')

		if (fullHiCode.length !== 4) {
			return
		}

		setHiCodeZ(fullHiCode)
		result(fullHiCode)
	}, [hiCode])

	return (
		<Prompt
			id='my-modal-6'
			heading='Enter HiCode for placing order'
			subheading={
				<div className='text-center font-[400] text-[0.9rem] mb-[3rem] leading-[1.125rem]'>
					<div className='mb-[0.25rem] text-base-content'>{errorMsg}</div>
				</div>
			}
			// reduceMarginTop={true}
			isOpen={isOpen}
			onClose={onModalClose}
		>
			<form className='flex flex-col items-center'>
				<div className='flex mb-4'>
					{hiCode.map((_, index) => (
						<input
							type='number'
							key={index.toString()}
							value={hiCode[index]}
							onChange={(e) => handleHiCodeChange(e, index)}
							onFocus={handleOnClick}
							minLength={0}
							maxLength={1}
							ref={inputRefs[index]}
							className={`border-b-2 py-2 px-4 text-center w-[4rem] mr-2 focus:outline-none ${
								isHighlight ? 'border-primary' : 'border-b-black'
							} `}
							onKeyPress={(e) => {
								if (!/[0-9]/.test(e.key)) {
									e.preventDefault()
								}
							}}
							required
						/>
					))}
				</div>
				{error && (
					<div className='mb-4 animate-pulse'>
						<div
							className='px-[1.5rem] flex tracking-wider font-[550] text-[0.875rem] leading-[1.125rem] text-center text-base-content'
							role='alert'
						>
							Please enter the correct HiCode.
						</div>
					</div>
				)}
			</form>
		</Prompt>
	)
}

export default PromptHiCode
