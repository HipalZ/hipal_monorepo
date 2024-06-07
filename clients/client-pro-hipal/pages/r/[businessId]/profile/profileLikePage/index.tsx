import Image from 'next/image'
import React, { useState } from 'react'
import ProfileHeader from '@components/molecules/profileHeader'
import { BsSuitHeartFill } from 'react-icons/bs'
import { useLogin } from '@components/store/useLogin'
import axios from '@utils/axios'
import { useQuery } from '@tanstack/react-query'

function ProfileLikePage() {
	const [search, setSearch] = useState('')
	const userDetails = useLogin((s) => s.userDetails)
	const handleChange = (e) => {
		setSearch(e.target.value)
	}

	const handleOnClick = async (id) => {
		const config = {
			method: 'POST',
			url: `/v1/businesses/${id}/userlike`,
			data: {
				userId: userDetails._id,
			},
		}
		await axios(config)
		refetch()
	}

	const dashboardData = async () => {
		const res = await axios.get('/v1/businesses/get/allbusiness')
		const result = await res.data
		return result
	}

	const { isPending, error, data, refetch } = useQuery({
		queryKey: ['allbiz'],
		queryFn: dashboardData,
	})

	const searchRestaurants = (data || []).filter(
		(ele) =>
			ele?.businessName?.toLowerCase().includes(search?.toLowerCase()) &&
			ele.likes.includes(userDetails._id),
	)

	if (isPending) return 'Loading...'
	if (error) return `An error has occurred: ${error.message}`

	return (
		<div>
			<ProfileHeader />
			<div className='flex items-center px-[2rem] justify-center mt-2'>
				<label htmlFor='simple-search' className='sr-only'>
					Search
				</label>
				<div className='relative w-full'>
					<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
						<svg
							aria-hidden='true'
							className='w-5 h-5 text-[#FF5019]/80 dark:text-[#FF5019]'
							fill='currentColor'
							viewBox='0 0 20 20'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								fill-rule='evenodd'
								d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
								clip-rule='evenodd'
							/>
						</svg>
					</div>
					<input
						onChange={handleChange}
						type='text'
						id='simple-search'
						className='border border-gray-300 text-gray-900 text-sm rounded-xl focus:outline-none focus:border-[#E96108] block w-full pl-10 p-2.5'
						placeholder='Search by restaurant'
						required
					/>
				</div>
			</div>
			<div className='font-[550] ml-[1.5rem] mt-[1.5rem] mb-[1rem] text-[1.125rem] leading-4'>
				Likes
			</div>
			{searchRestaurants.length > 0 ? (
				<div className='mx-[1.5rem] grid grid-cols-2 gap-4 mt-[0.5rem] mb-[2rem]'>
					{searchRestaurants?.map((ele, index) => (
						<div key={index.toString()} className='relative focus:text-red-500'>
							<BsSuitHeartFill
								onClick={() => handleOnClick(ele._id)}
								className={`absolute w-[1.5rem] h-[1.5rem] right-[1.2rem] focus:text-red-500 bottom-[5rem] z-10 ${
									ele.likes.includes(userDetails._id) ? 'text-red-500' : 'text-white/90'
								}`}
							/>
							<div className='relative'>
								<Image
									className='w-[11rem] h-[13.5rem] rounded-2xl shadow-inner object-cover'
									width={176}
									height={216}
									src={
										ele?.wallpaper
											? ele?.wallpaper
											: 'https://images.pexels.com/photos/2307221/pexels-photo-2307221.jpeg?auto=compress&cs=tinysrgb&w=300'
									}
									alt='Banner pic'
								/>
								<div className='absolute bottom-0 left-0 w-full rounded-b-2xl h-1/2 bg-gradient-to-t from-black to-transparent' />
							</div>
							<div className='flex mt-[0.5rem]'>
								<div className='bg-white w-[3rem] h-[3rem] mt-[0.5rem]'>
									<div
										style={{
											width: 'calc(100% - 4px)',
											height: 'calc(100% - 4px)',
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
										}}
									>
										<Image
											layout='fixed'
											objectFit='contain'
											width={40}
											height={40}
											className=''
											alt='logo'
											src={ele?.logo}
										/>
									</div>
								</div>

								<div className='text-[#023047] mt-4 ml-2 capitalize font-medium leading-5 text-[0.9375rem] line-clamp-2'>
									{ele?.businessName}
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className='text-center mt-[5rem] text-[#023047] text-2xl'>No Result Found</div>
			)}
		</div>
	)
}

export default ProfileLikePage
