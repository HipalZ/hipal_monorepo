import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useLogin } from '@components/store/useLogin'
import axios from '@utils/axios'
import { isEmpty } from 'lodash-es'
import { useRouter } from 'next/router'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import { IoIosArrowBack } from 'react-icons/io'
import { useRoutingFlow } from '@components/store/useRoutingFlow'
import HipalLogo from '@assets/svg/Hipal_logo.svg'

function ProfileEdit() {
	const { getPreviousPath } = useRoutingFlow()
	const [data, setData] = useState({
		name: '',
		profileDescription: '',
		phone: '',
		email: '',
		gender: '',
		DOB: '',
	})
	const [apiData, setApiData] = useState({
		name: '',
		profileDescription: '',
		phone: '',
		email: '',
		gender: '',
		DOB: '',
	})

	const handleOnChange = (event) => {
		const { name, value } = event.target
		setData((prevUserData) => ({ ...prevUserData, [name]: value }))
	}

	const router = useRouter()
	const { businessId } = router.query

	const handleSubmit = (event) => {
		event.preventDefault()
		result()
		router.push(`${routePaths[PAGE_TYPES.PROFILE](`${businessId}`)}`)
	}

	const userData = useLogin((s) => s.userDetails)
	const setUserDetails = useLogin((s) => s.setUserDetails)

	const result = async () => {
		try {
			const config = {
				method: 'PUT',
				url: `/v1/users/${userData?._id}/updateUser`,
				data: {
					name: data.name,
					phone: data.phone,
					email: data.email,
					DOB: data.DOB,
					userDiscription: data.profileDescription,
					gender: data.gender,
				},
			}

			const user = await axios(config)
			const res = user.data.data
			if (!isEmpty(res)) {
				setApiData(res)
			}
			if (!isEmpty(res)) setUserDetails(res)
		} catch (error) {
			console.error(error)
		}
	}

	const navigateBeforePage = () =>{
		router.push(`/r/${businessId}/profile/userProfile`)
	}
	return (
		<div className='w-screen h-full bg-[#fbfbfb]'>
			<div className=' text-[#002D4B] rounded-[0.625rem]'>
				<div className='relative flex flex-row w-full items-center pt-[1rem] pl-[1rem]'>
					<div onClick={navigateBeforePage}>
						<IoIosArrowBack size={24} className='stroke-1' />
					</div>
					<div className='absolute left-[40%]'>
						<Image src={HipalLogo} alt='HipalLogo' />
					</div>
				</div>
				<div className='mt-[3.5rem] flex justify-center items-center'>
					<div
						className='text-4xl flex justify-center items-center rounded-full border w-[110px] h-[110px]  border-1 border-gray-500'
					>
						{userData.name?.[0]}
					</div>
				</div>
				<div className='my-[1.25rem] mx-8 text-center text-[#002D4B]'>
					<div className='font-[700] text-[1.875rem] leading-[1.7rem] mb-[0.75rem]'>
						{userData.name}
					</div>
					<div className='text-sm font-[400]'>Let’s make hipal happen!❤🔥</div>
				</div>
				<form onSubmit={handleSubmit}>
					<div className='m-auto space-y-6 px-[3rem] '>
						<div className='relative'>
							<input
								name='name'
								onChange={handleOnChange}
								value={data.name}
								type='text'
								id='floating_outlined'
								className='block w-full pt-3 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-500 rounded-md border dark:text-white focus:outline-none focus:border-[#FF5019] dark:border-gray-600 peer'
								placeholder=''
							/>
							<label
								htmlFor='floating_outlined'
								className='absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#FF5019] peer-focus:dark:text-[#FF5019] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1'
							>
								Name
							</label>
						</div>
						<div className='relative'>
							<input
								name='phone'
								onChange={handleOnChange}
								value={data.phone}
								type='text'
								id='floating_outlined'
								className='block w-full pt-3 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-1 border-gray-500  rounded-md  dark:text-white focus:outline-none focus:border-[#FF5019] dark:border-gray-600 peer'
								placeholder=' '
							/>
							<label
								htmlFor='floating_outlined'
								className='absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#FF5019] peer-focus:dark:text-[#FF5019] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1'
							>
								Phone
							</label>
						</div>
						<div className='relative'>
							<input
								name='email'
								onChange={handleOnChange}
								value={data.email}
								type='text'
								id='floating_outlined'
								className='block w-full pt-3 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-1 border-gray-500 rounded-md dark:text-white focus:outline-none focus:border-[#FF5019] dark:border-gray-600 peer'
								placeholder=' '
							/>
							<label
								htmlFor='floating_outlined'
								className='absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#FF5019] peer-focus:dark:text-[#FF5019] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1'
							>
								Email Id
							</label>
						</div>
						<div className='relative'>
							<input
								name='DOB'
								onChange={handleOnChange}
								type='date'
								id='floating_outlined'
								className='block w-full pt-3 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-1 border-gray-500 rounded-md dark:text-white focus:outline-none focus:border-[#FF5019] dark:border-gray-600 peer'
								placeholder=' '
							/>
							<label
								htmlFor='floating_outlined'
								className='absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#FF5019] peer-focus:dark:text-[#FF5019] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1'
							>
								Date of Birth
							</label>
						</div>
						<div className='relative'>
							<input
								name='profileDescription'
								onChange={handleOnChange}
								type='text'
								id='floating_outlined'
								className='block w-full pt-3 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-1 border-gray-500 rounded-md dark:text-white focus:outline-none focus:border-[#FF5019] dark:border-gray-600 peer'
								placeholder=' '
							/>
							<label
								htmlFor='floating_outlined'
								className='absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#FF5019] peer-focus:dark:text-[#FF5019] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1'
							>
								Description
							</label>
						</div>
						<div className='relative'>
							<select
								name='gender'
								id='gender'
								onChange={handleOnChange}
								className='border border-1 border-gray-500 block w-full py-4 px-2 mb-0 text-base text-gray-900 bg-transparent rounded-md dark:text-white focus:outline-none focus:border-[#FF5019] dark:border-gray-600'
							>
								<option value='gender'>Gender</option>
								<option value='male'>Male</option>
								<option value='female'>Female</option>
							</select>
						</div>
					</div>
					<div className='flex mx-[3rem]'>
						<button
							type='submit'
							className='on_active_bounce w-full px-12 py-2 font-normal btn btn-primary mt-[3rem] mb-[1.5rem] rounded-full'
						>
							Saved
						</button>
					</div>
				</form>

				<div className='flex flex-wrap justify-center opacity-50'>
					<Image src={HipalLogo} alt='HipalLogo' />
				</div>
				<div className='text-[0.6125rem] pb-[1.5rem] opacity-50 flex flex-wrap justify-center'>
					version 1.3
				</div>
			</div>
		</div>
	)
}

export default ProfileEdit
