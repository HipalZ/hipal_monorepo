import Image from 'next/image'
import React from 'react'
import { HiChevronRight } from 'react-icons/hi'
const GetStartedButton = () => {
	return (
		<a
			href='//api.whatsapp.com/send?phone=919177914130&text=Hi, i would like to know more about Hipal'
			target='_blank'
			rel='noreferrer noopener'
		>
			<div className='mx-8 lg:mx-0 lg:w-[22.18rem] lg:mr-[5.75rem] lg:h-[5rem] rounded-3xl my-10 px-[3.25rem] w-[20rem] py-2 bg-[#F2634C] flex flex-row justify-center items-center'>
				<button className='text-white font-normal lg:text-2xl '>Get started</button>
				<div className='lg:mx-2 inline-flex'>
					<HiChevronRight size={20} color='#fff' />
				</div>
			</div>
		</a>
	)
}

export default GetStartedButton
