import Image from 'next/image'
import React from 'react'
import welcome from '@assets/svg/welcome.svg'
import LogoHeader from '../logoHeader'

const HeaderLogin = () => {
	return (
		<>
			<LogoHeader />
			<div className='flex justify-center mb-[1.7rem]'>
				<Image src={welcome} alt='welcome image' objectFit='cover' objectPosition='center' />
			</div>
			<div className='pl-10 text-base-content font-[700] text-[1.9rem] leading-7 mt-[61px] mb-[1.7rem]'>
				Login
			</div>
		</>
	)
}

export default HeaderLogin
