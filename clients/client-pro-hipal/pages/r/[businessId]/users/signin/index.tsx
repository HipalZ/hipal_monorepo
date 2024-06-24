import { useLogin } from '@components/store/useLogin'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import axios from '@utils/axios'
import { useRouter } from 'next/router'
import { memo, useState } from 'react'
import { toast } from 'react-toastify'
import HeaderLogin from '@components/molecules/headerLogin'

function LoginPage() {
	const phoneNumber = useLogin((s) => s.phoneNumber)
	const setPhone = useLogin((s) => s.setPhoneNumber)
	const [activeButton, setActiveButton] = useState(false)

	const router = useRouter()
	const { businessId } = router.query

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			const config = {
				method: 'POST',
				url: '/v1/users?action=signup&clientRole=user',
				data: {
					phone: phoneNumber,
					role: 'HIPAL_CUSTOMER',
				},
			}
			const res = await axios(config)

			if (res.status === 201) {
				router.push(`${routePaths[PAGE_TYPES.OTP](`${businessId}`)}`)
			} else if (res.status === 400) {
				router.push(`${routePaths[PAGE_TYPES.OTP](`${businessId}`)}`)
			} else {
				toast.error('Please enter valid phone number')
				router.push(`${routePaths[PAGE_TYPES.SIGN_IN](`${businessId}`)}`)
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

	function handlePhoneNumber(e: any) {
		setPhone(e?.target.value)
		if (e.target.value.length > 9) {
			setActiveButton(true)
		} else {
			setActiveButton(false)
		}
	}

	return (
		<div>
			<HeaderLogin />
			<div className='pl-10 font-[400] text-[0.9rem] leading-[1.125rem]'>
				<p>Enter your phone number</p>
			</div>
			<div className='mt-[2.5rem]'>
				<form onSubmit={handleSubmit}>
					<div className='relative ml-10 mr-20 mt-6 mb-[5.89rem] space-y-4'>
						<div className='relative'>
							<input
								onChange={handlePhoneNumber}
								type='number'
								id='floating_outlined'
								className='block w-full pt-2 pb-2 pl-4 pr-4 mb-0 text-base border rounded-lg text-base-content bg-base-100 border-primary dark:text-base-content focus:outline-none focus:border-primary dark:border-primary peer'
								placeholder=' '
								value={phoneNumber}
								maxLength={10}
								minLength={10}
								required
							/>
							<label
								htmlFor='floating_outlined'
								className='absolute text-sm text-base-content dark:text-base-content duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-base-100 px-2 peer-focus:px-2 peer-focus:text-base-content peer-focus:dark:text-base-content peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1'
							>
								Phone number
							</label>
						</div>
					</div>
					<div
						className={`${
							activeButton
								? 'on_active_bounce pointer-events-auto opacity-100'
								: 'pointer-events-none opacity-50'
						} flex justify-center mb-5 on_active_bounce bg-primary rounded-full ml-10 mr-10 font-[600] py-[1rem] text-white text-[18px] leading-[1.15rem]`}
					>
						<button type='button'>Let me in</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default memo(LoginPage)
