import HeaderLogin from '@components/molecules/headerLogin'
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
	const { isLogin, setIsLogin, phoneNumber } = useLogin()

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
						role: 'HIPAL_CUSTOMER',
					},
				}

				const response = await axios(config)
				console.log('user data', response.data)

				if (!isEmpty(response.data)) setUserDetails(response.data)
				if (
					response.data.name === null ||
					response.data.name === undefined ||
					response.data.name === ''
				) {
					router.push(routePaths[PAGE_TYPES.SIGN_UP](`${businessId}`))
				} else if (response.status === 201) {
					setIsLogin(true)
					router.push(routePaths[PAGE_TYPES.CATEGORY](`${businessId}`))
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
		<>
			<HeaderLogin />
			<div className='flex flex-col mt-8'>
				<div className='font-[400] text-[0.9rem] mb-[5rem] leading-[1.125rem]'>
					<div className='text-[#131540] text-base ml-10 mb-[0.25rem]'>
						Enter the OTP for {phoneNumber}
					</div>
					{/* <div className='flex flex-wrap justify-center'>
						<Link href={`${routePaths[PAGE_TYPES.SIGN_IN](`${businessId}`)}`}>
							<span className='text-primary leading-[1.125rem] text-[1rem] cursor-pointer'>
								Edit
							</span>
						</Link>
					</div> */}
				</div>
				<form className='flex flex-col items-center'>
					<div className='flex mb-4'>
						{otp.map((_, index) => (
							<input
								type='number'
								key={index}
								value={otp[index]}
								onChange={(e) => handleOtpChange(e, index)}
								onFocus={handleOnClick}
								max={9}
								min={0}
								ref={inputRefs[index]}
								className={`border-b-2 py-2 px-4 text-center text-base-content w-[4rem] mr-2 focus:outline-none ${
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
								Please enter the correct otp.
							</div>
						</div>
					)}
					{/* <div className='flex flex-wrap justify-center'>
						<div className='mr-[0.25rem]'>Didn’t receive the code? </div>

						<button
							onClick={() => sendOtp()}
							role='button'
							className='text-primary leading-[1.125rem] text-[1rem] cursor-pointer'
						>
							Resend
						</button>
					</div> */}
				</form>
			</div>
		</>
	)
}

export default OtpPage
