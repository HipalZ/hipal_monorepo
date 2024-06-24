import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { IoIosArrowBack } from 'react-icons/io'
import HiLogo from '@assets/svg/hipal_signin_logo.svg'
import { useRoutingFlow } from '@components/store/useRoutingFlow'
const LogoHeader = () => {
	const { getPreviousPath } = useRoutingFlow()

	return (
		<>
			<div className='flex items-center mb-[61px] mt-[10px]'>
				<div className='relative flex flex-row w-full items-center pt-[1rem] pl-6'>
					<Link href={`${getPreviousPath()}`}>
						<IoIosArrowBack size={24} className='stroke-2' />
					</Link>
					<div className='absolute left-[35%]'>
						<Image src={HiLogo} alt='HipalLogo' />
					</div>
				</div>
			</div>
		</>
	)
}

export default LogoHeader
