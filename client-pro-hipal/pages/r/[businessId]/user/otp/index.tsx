import { useLogin } from '@components/store/useLogin'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import axios from '@utils/axios'
import { isEmpty } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
// /v1/users/otp

function OtpPage() {
	const [otp, setOtp] = useState(['', '', '', ''])
	const [error, setError] = useState('')
	const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]
	const [isHighlight, setIsHighlight] = useState<boolean>(false)
	const router = useRouter()
	const { businessId } = router.query
	const sendOtp = useLogin((s) => s.sendOtp)
	const setUserDetails = useLogin((s) => s.setUserDetails)
	const { setIsLogin, phoneNumber, isLogin } = useLogin()
	const direction = useLogin((s) => s.direction)

	const handleOtpChange = (e, index) => {
		if (e.target.value > 9) return

		const newOtp = [...otp]
		newOtp[index] = e.target.value

		// Move focus to next input field
		if (index < inputRefs.length - 1 && e.target.value !== '') {
			// @ts-ignore
			inputRefs[index + 1].current?.focus()
		}

		setOtp(newOtp)
	}
	const handleOnClick = () => {
		setIsHighlight(true)
	}

	useEffect(() => {
		if (!phoneNumber || phoneNumber.length !== 10) {
			router.push(routePaths[PAGE_TYPES.SIGN_UP](`${businessId}`))
		}
	}, [])
	const paymentCustomer = async(data) => {
		try {
			const config = {
				method: 'POST',
				url: '/v1/payments/customer',
				data: {
					phone: data.phone,
					businessId: businessId,
					name: data.name
				},
			}
			await axios(config)
		} catch (err) {
			console.log(err);
		}
	}
	
	useEffect(() => {
		const verifyOtp = async () => {
			const fullOtp = otp.join('')
			if (fullOtp.length !== 4) return

			try {
				const fullOtp = otp.join('')
				if (fullOtp.length !== 4) {
					return
				}

				const config = {
					method: 'POST',
					url: '/v1/users?action=login&clientRole=user',
					data: {
						phone: phoneNumber,
						otp: fullOtp,
					},
				}

				const response = await axios(config)
				if (!isEmpty(response.data)) setUserDetails(response.data)

				if (response.status === 201) {
					paymentCustomer(response.data)
					setIsLogin(true)
					if (direction === 'loyalty') {
						router.push(routePaths[PAGE_TYPES.LOYALTY](`${businessId}`))
					} else {
						router.push(routePaths[PAGE_TYPES.FINAL_CART](`${businessId}`))
					}

					return
				}

				setError('Incorrect OTP. Please try again.')
				setOtp(['', '', '', ''])
				// @ts-ignore
				inputRefs[0].current.focus()
			} catch (error) {
				setError('Incorrect OTP. Please try again.')
				setOtp(['', '', '', ''])
				// @ts-ignore
				inputRefs[0].current.focus()
			}
		}

		verifyOtp()
	}, [otp, router])

	return (
		<div className='flex flex-col items-center justify-center mt-8'>
			<div className='ml-auto font-[400] my-auto text-right text-[1.25rem] leading-4 pr-[1.25rem] text-base-content '>
				<Link href={`${routePaths[PAGE_TYPES.EXPLORER](`${businessId}`)}`} passHref>
					Skip
				</Link>
			</div>
			<div className='mt-[4.35rem]'>
				<h1 className='mb-6 text-3xl font-bold'>Enter OTP</h1>
			</div>
			<div className='text-center font-[400] text-[0.9rem] mb-[6rem] leading-[1.125rem]'>
				<div className='mb-[0.25rem]'>Please enter the OTP received on</div>
				<div className='flex flex-wrap justify-center'>
					<div className='mr-[0.25rem]'>+91 {phoneNumber}</div>
					<Link href={`${routePaths[PAGE_TYPES.SIGN_IN](`${businessId}`)}`}>
						<span className='text-primary leading-[1.125rem] text-[1rem] cursor-pointer'>Edit</span>
					</Link>
				</div>
			</div>
			<form className='flex flex-col items-center'>
				<div className='flex mb-4'>
					{otp.map((_, index) => (
						<input
							type='number'
							key={index.toString()}
							value={otp[index]}
							onChange={(e) => handleOtpChange(e, index)}
							onFocus={handleOnClick}
							max={9}
							min={0}
							ref={inputRefs[index]}
							className={`border-b-2 py-2 px-4 text-center bg-base-200 text-base-content w-[4rem] mr-2 focus:outline-none ${isHighlight ? 'border-primary' : 'border-b-black'
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
							Please enter the correct otp.
						</div>
					</div>
				)}
				<div className='flex flex-wrap justify-center'>
					<div className='mr-[0.25rem]'>Didn’t receive the code? </div>

					<button
						type='submit'
						onClick={() => sendOtp()}
						role='button'
						className='text-primary leading-[1.125rem] text-[1rem] cursor-pointer'
					>
						Resend
					</button>
				</div>
			</form>
		</div>
	)
}

export default OtpPage
