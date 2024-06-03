import welcomeImage from '@assets/newHI.svg'
import { useLogin } from '@components/store/useLogin'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import axios from '@utils/axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { memo } from 'react'
import { toast } from 'react-toastify'

function SignUp() {
	const phone = useLogin((s) => s.phoneNumber)
	const name = useLogin((s) => s.name)

	const setPhone = useLogin((s) => s.setPhoneNumber)
	const setName = useLogin((s) => s.setName)

	const router = useRouter()
	const { businessId } = router.query

	const alreadyRegister = async (phoneNumber) => {
		try {
			const config = {
				method: 'POST',
				url: '/v1/users/otp?clientRole=user',
				data: {
					phone: phoneNumber,
				},
			}
			const res = await axios(config)

			if (res.status === 200) {
				router.push(`${routePaths[PAGE_TYPES.OTP](`${businessId}`)}`)
			}
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.errors?.[0]?.message ?? 'Please check your credentials'
			toast.error(errorMessage)

			if (errorMessage === 'Not Found') {
				router.push(`${routePaths[PAGE_TYPES.SIGN_UP](`${businessId}`)}`)
			}
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		const userData = {
			name: name || 'user',
			phone: phone,
			role: 'HIPAL_CUSTOMER',
		}

		const config = {
			method: 'POST',
			url: '/v1/users?action=signup&clientRole=user',
			data: userData,
		}
		try {
			const res = await axios(config)
			if (res.status === 201) {
				router.push(`${routePaths[PAGE_TYPES.OTP](`${businessId}`)}`)
			} else {
				console.log(`Submitted res: ${res}`)
			}
		} catch (error: any) {
			toast.error('User already registered')
			alreadyRegister(userData?.phone)
		}
	}

	return (
		<div className='bg-base-100'>
			<div className='flex items-center my-[1.7rem]'>
				<div className='ml-auto font-[400] my-auto text-right text-[1.25rem] leading-4 pr-[1.25rem] text-base-content'>
					<Link href={`${routePaths[PAGE_TYPES.EXPLORER](`${businessId}`)}`} passHref>
						Skip
					</Link>
				</div>
			</div>
			<div className='flex justify-center mb-[1.7rem]'>
				<div className='mx-[4rem] w-[22.25rem] h-[13.8125rem] rounded-[2rem]'>
					<Image src={welcomeImage} alt='welcome image' objectFit='cover' objectPosition='center' />
				</div>
			</div>
			<div className='text-base-content font-[700] text-[1.9rem] leading-7 text-center mb-[1.7rem]'>
				Sign Up
			</div>
			<div className='text-center font-[400] text-[0.9rem] leading-[1.125rem]'>
				<div>Enter your Name and phone Number </div>
				<div>to get started</div>
			</div>
			<div>
				<form onSubmit={handleSubmit}>
					<div className='relative w-full px-[3.125rem] mt-6 mb-[2rem] ml-0 mr-0 space-y-4'>
						<div className='relative'>
							<input
								onChange={(e) => setName(e.target.value)}
								type='text'
								id='floating_outlined'
								className='block w-full pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 text-base border rounded-lg text-base-content bg-base-100 border-primary dark:text-base-content focus:outline-none focus:border-primary dark:border-primary peer'
								placeholder=' '
								required
							/>
							<label
								htmlFor='floating_outlined'
								className='absolute text-sm text-base-content dark:text-base-content duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-base-100 px-2 peer-focus:px-2 peer-focus:text-base-content peer-focus:dark:text-base-content peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1'
							>
								Name
							</label>
						</div>
						<div className='relative'>
							<input
								onChange={(e) => setPhone(e.target.value)}
								type='tel'
								id='floating_outlined2'
								className='block w-full pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 bg-transparent border rounded-lg text-base-content border-primary dark:text-base-content focus:outline-none focus:border-primary dark:border-primary peer'
								placeholder=' '
								maxLength={10}
								minLength={10}
								required
							/>
							<label
								htmlFor='floating_outlined2'
								className='absolute text-sm text-base-content dark:text-base-content duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-base-100 px-2 peer-focus:px-2 peer-focus:text-base-content peer-focus:dark:text-base-content peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1'
							>
								Phone number
							</label>
						</div>
					</div>
					<div className='flex justify-center mb-5'>
						<button
							type='submit'
							className='on_active_bounce bg-primary rounded-full w-[20.5rem] py-[0.75rem] text-white leading-[1.15rem]'
						>
							Sign Up
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default memo(SignUp)
