import Image from 'next/image'
import React from 'react'
import arrow from '@assets/svg/arrow.svg'

const StartTrail = () => {
	const renderTrail = () => (
		<>
			<div className='lg:w-48 flex items-center mx-4 lg:mx-10'>
				<p className='lg:text-base text-sm font-bold'>START YOUR FREE TRIAL</p>
				<Image src={arrow} alt='arrow' height={24} width={24} />
			</div>
		</>
	)

	return (
		<div
			style={{
				background:
					'linear-gradient(90deg, #D3CEF5 3.1%, #D9F4D1 31.63%, #D3CFF3 56.86%, #F4C3CC 100%)',
			}}
			className='flex justify-center items-center mb-11 overflow-hidden h-24 lg:h-16'
		>
			<div className='flex w-screen marquee1'>
				{renderTrail()}
				{renderTrail()}
				<div className='hidden lg:inline-flex'>
					{renderTrail()}
					{renderTrail()}
					{renderTrail()}
					{renderTrail()}
					{renderTrail()}
				</div>
			</div>
		</div>
	)
}

export default StartTrail
