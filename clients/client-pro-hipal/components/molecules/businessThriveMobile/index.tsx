import Image from 'next/image'
import React from 'react'
import arrowLine from '@assets/svg/arrow_line.svg'
import hipalPro from '@assets/svg/pro_hipal.svg'
const BusinessThriveMobile = () => {
	return (
		<>
			{/* large screen hidden which is present in small screen */}
			<div className='lg:hidden mx-8 my-4 border-b-2 border-[#D9D9D9]'>
				<h1 className='text-2xl my-4'>Hipal.life</h1>
				<p className='text-base text-[#131540] opacity-50'>
					Digital menu, Content management system, POS, Customize themes.
				</p>
				<div className='flex my-4 items-center'>
					<p className='text-2xl'>Check it out </p>
					<div className='mx-2'>
						<Image
							src={arrowLine}
							alt='arrow_line'
							height={18}
							width={18}
							className='p-1  bg-[#F2634C] rounded-2xl'
						/>
					</div>
				</div>
			</div>
			<div className='lg:hidden mx-8 mb-10 lg:mb-0'>
				<div className='my-4'>
					<Image src={hipalPro} alt='pro_hipal' height={30} width={110} />
				</div>
				<p className='text-base text-[#131540] opacity-50'>
					All hipal.life features + hipeople, hitable, hikitches,
				</p>
				<div className='flex my-4 items-center'>
					<p className='text-2xl'>Check it out </p>
					<div className='mx-2'>
						<Image
							src={arrowLine}
							alt='arrow_line'
							height={20}
							width={20}
							className='p-1 lg:p-2 bg-[#F2634C] rounded-2xl'
						/>
					</div>
				</div>
			</div>
		</>
	)
}

export default BusinessThriveMobile
