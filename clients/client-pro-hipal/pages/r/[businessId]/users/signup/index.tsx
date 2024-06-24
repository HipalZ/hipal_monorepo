import Popup from '@components/atoms/Popup'
import SignUpPopUp from '@components/atoms/signUpPopUp'
import LogoHeader from '@components/molecules/logoHeader'
import { useLogin } from '@components/store/useLogin'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import axios from '@utils/axios'
import { resolve } from 'dns'
import e from 'express'
import { useRouter } from 'next/router'
import { memo, useState } from 'react'
import { toast } from 'react-toastify'

function SignUp() {
	const [isModalOpen, setIsModalOpen] = useState(true)
	const name = useLogin((s) => s.name)
	const setName = useLogin((s) => s.setName)
	const userDetails = useLogin((s) => s.userDetails)
	const router = useRouter()
	const { businessId } = router.query

	const closeModal = () => {
		// setIsModalOpen(false)
		// router.push(`${routePaths[PAGE_TYPES.SIGN_IN](`${businessId}`)}`)
	}
	const handleSubmit = async (e) => {
		e.preventDefault()

		const userData = {
			name: name,
			// phone: phone,
			// role: 'HIPAL_CUSTOMER',
		}

		const config = {
			method: 'PUT',
			url: `/v1/users/${userDetails?._id}/updateUser`,
			data: userData,
		}
		try {
			const res = await axios(config)

			console.log(res)
			if (res.status === 200) {
				router.push(`${routePaths[PAGE_TYPES.EXPLORER](`${businessId}`)}`)
			} else {
				console.log(`Submitted res: ${res}`)
			}
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.errors?.[0]?.message ?? 'Please check your credentials'
			toast.error('User already registered')
			if (errorMessage === 'User registered') {
				router.push(`${routePaths[PAGE_TYPES.SIGN_IN](`${businessId}`)}`)
			}
		}
	}
	const [activeButton, setActiveButton] = useState(false)
	function handleName(e: any) {
		setName(e?.target.value)
		if (e.target.value.length > 2) {
			setActiveButton(true)
		} else {
			setActiveButton(false)
		}
	}
	return (
		<>
			<SignUpPopUp show={isModalOpen} onClose={closeModal}>
				<div className='bg-white rounded-t-3xl'>
					<LogoHeader />
					<div className='pl-10 text-base-content font-[700] text-[1.9rem] leading-7 mt-[61px] mb-[1.7rem]'>
						Sign Up
					</div>
					<div className='pl-10 text-[0.9rem] leading-[1.125rem]'>
						<p className='text-base font-[400] text-[#131540]'>
							Please enter your name to get the party started
						</p>
					</div>
					<form onSubmit={handleSubmit}>
						<div className='relative w-full px-10 mt-6 mb-[2rem] ml-0 mr-0 space-y-4'>
							<div className='relative'>
								<input
									onChange={handleName}
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
						</div>

						<div
							className={`${
								activeButton
									? 'on_active_bounce pointer-events-auto opacity-100'
									: 'pointer-events-none opacity-50'
							} flex justify-center mb-5 on_active_bounce bg-primary rounded-full ml-10 mr-10 font-[600] py-[1rem] text-white text-[18px] leading-[1.15rem]`}
						>
							<button className=''>Let me in</button>
						</div>
					</form>
				</div>
			</SignUpPopUp>
		</>
	)
}

export default memo(SignUp)
