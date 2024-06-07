import React from 'react'
import TitleTransition from '../titleTransition'
import GetStartedButton from '@components/atoms/getStartedButton'
import IphoneBackground from '../iphoneBackground'

const TopSection = () => {
	return (
		<div className='w-screen lg:mb-[2.75rem] lg:ml-[5.75rem] flex flex-col items-center lg:flex-row lg:justify-between'>
			<div className='lg:w-1/2 flex lg:mb-[4rem] flex-col justify-between items-center lg:justify-center lg:items-start'>
				<h1 className='text-[#131540] text-lg font-semibold lg:text-[3rem]'>A Complete</h1>
				<div className='flex lg:leading-10 justify-start items-center my-4 lg:my-[4rem] relative h-8 lg-h-0 lg:text-[4rem]'>
					<TitleTransition />
				</div>
				<div className='lg:mb-[4rem]'>
					<p className='text-center lg:leading-[3rem] lg:text-left text-base lg:text-[2.5rem] text-[#131540] opacity-50 mx-8 lg:mx-0 flex flex-col justify-center items-center'>
						The only 360 degree Management solution you need to manage and grow your business
					</p>
				</div>
				<GetStartedButton />
			</div>
			<div className='lg:w-1/2 w-screen'>
				<IphoneBackground />
			</div>
		</div>
	)
}

export default TopSection
