import Image from 'next/image'
import React from 'react'
import hikitchen from '@assets/svg/hikitchen.svg'
import hikitchenDish from '@assets/img/hikitchen_dish.png'
import hikitchenDishLG from '@assets/img/hikitchen_dish_lg.png'
import hipeople from '@assets/svg/hipeople.svg'
import hipeopleDish from '@assets/img/hipeople_dish.png'
import hipeopleDishLG from '@assets/img/hipeople_dish_lg.png'
import hitable from '@assets/svg/hitable.svg'
import hibiz from '@assets/svg/hibiz.svg'
import hitableDish from '@assets/img/hitable_dish.png'
import hitableDishLG from '@assets/img/hitable_dish_lg.png'
import { HiChevronRight } from 'react-icons/hi'
const CardSection = () => {
	return (
		<div className='lg:mb-[11.313rem]'>
			<div className='lg:flex lg:items-center lg:mr-[5.75rem]'>
				<div className='mx-8 lg:ml-[5.75rem] lg:mx-0 lg:overflow-y-hidden lg:overflow-x-auto lg:mt-[6.25rem] flex flex-row flex-nowrap justify-between overflow-x-auto items-center'>
					<div className='mr-2 lg:my-3 lg:mr-5 flex-shrink-0 h-[25rem] w-[10rem] lg:h-[24.057rem] lg:w-[24.842rem] px-2 bg-[#E7EEEA] flex flex-col items-center lg:justify-start rounded-xl'>
						<div className='flex self-start my-4 px-2 pl-[1rem] lg:pl-[2rem] lg:pt-[1rem] lg:px-0'>
							<Image
								src={hikitchen}
								alt='hikitchen'
								height={16.5}
								width={67.3}
								className='lg:hidden'
							/>
							<Image
								src={hikitchen}
								alt='hikitchen'
								height={36.009}
								width={148.035}
								className='hidden lg:inline-flex'
							/>
						</div>
						<div className='lg:hidden my-[0.125rem]'>
							<Image src={hikitchenDish} alt='hikitchen' height={103} width={136} />
						</div>
						<div className='hidden lg:inline-flex'>
							<Image src={hikitchenDishLG} alt='hikitchen' height={107} width={372.345} />
						</div>
						<div className='mt-3 mb-3 mr-[0.125rem] lg:pt-2 lg:px-3'>
							<p className='text-[#131540] text-sm font-normal opacity-50 lg:text-lg'>
								Hello Kitchen! Our chef-approved, user-friendly, and mobile-compatible POS system
								offers seamless information transparency, making your kitchen a culinary haven.
							</p>
						</div>
						{/* <div className='pl-[1rem] mb-3 flex self-start lg:pl-[2rem] lg:px-0'>
							<button className='bg-[#455F50] rounded-2xl p-1'>
								<Image src={rightArrow} alt='right_arrow' height={20} width={20} />
							</button>
						</div> */}
					</div>
					<div className='mx-2 lg:mx-5 flex-shrink-0 h-[25rem] w-[10rem] bg-[#E7EDFD] lg:h-[24.057rem] lg:w-[24.842rem]  px-2 flex flex-col items-center lg:justify-start rounded-xl'>
						<div className='flex self-start my-4 pl-[1rem] px-2 lg:pl-[2rem] lg:pt-[1rem] lg:px-0'>
							<Image
								src={hitable}
								alt='hitable'
								height={16.75}
								width={67.3}
								className='lg:hidden'
							/>
							<Image
								src={hitable}
								alt='hitable'
								height={36.009}
								width={148.035}
								className='hidden lg:inline-flex'
							/>
						</div>
						<div className='lg:hidden'>
							<Image src={hitableDish} alt='hitable' height={103} width={136} />
						</div>
						<div className='hidden lg:inline-flex'>
							<Image src={hitableDishLG} alt='hitable' height={107} width={372.345} />
						</div>
						<div className='mt-3 mb-3 mr-[0.125rem]  lg:pt-2 lg:px-3'>
							<p className='text-[#131540] text-sm font-normal opacity-50 lg:text-lg'>
								Streamline restaurant operations effortlessly with our user-friendly, mobile-ready
								POS system. A game-changing investment for owners seeking efficiency and modern
								convenience.
							</p>
						</div>
						{/* <div className='mb-3 flex self-start  pl-[1rem]  lg:pl-[2rem] lg:px-0'>
							<button className='bg-[#2C62F0] rounded-2xl p-1'>
								<Image src={rightArrow} alt='right_arrow' height={20} width={20} />
							</button>
						</div> */}
					</div>
					<div className='mx-2 lg:mx-5 flex-shrink-0 h-[25rem] w-[10rem] bg-[#E7EDFD] lg:h-[24.057rem] lg:w-[24.842rem] px-2 flex flex-col items-center lg:justify-start rounded-xl'>
						<div className='flex self-start my-4 pl-[1rem] px-2 lg:pl-[2rem] lg:pt-[1rem] lg:px-0'>
							<Image
								src={hipeople}
								alt='hipeople'
								height={16.5}
								width={67.3}
								className='lg:hidden'
							/>
							<Image
								src={hipeople}
								alt='hipeople'
								height={36.009}
								width={148.035}
								className='hidden lg:inline-flex'
							/>
						</div>
						<div className='lg:hidden'>
							<Image src={hipeopleDish} alt='hipeople' height={103} width={136} />
						</div>
						<div className='hidden lg:inline-flex'>
							<Image src={hipeopleDishLG} alt='hipeople' height={107} width={372.345} />
						</div>
						<div className='mt-3 mb-3 mr-[0.125rem] lg:pt-2 lg:px-3'>
							<p className='text-[#131540] text-sm font-normal opacity-50 lg:text-lg'>
								For effortless staff management, ensuring a seamless and efficient restaurant
								operation.
							</p>
						</div>
						{/* <div className='mb-3 flex self-start  pl-[1rem]  lg:pl-[2rem] lg:px-0'>
							<button className='bg-[#006494] rounded-2xl p-1'>
								<Image src={rightArrow} alt='right_arrow' height={20} width={20} />
							</button>
						</div> */}
					</div>
					<div
						style={{ background: 'rgba(231, 238, 234, 0.50)' }}
						className='ml-2 lg:ml-5 flex-shrink-0 h-[25rem] w-[10rem] lg:h-[24.057rem] lg:w-[24.842rem] px-2 flex flex-col items-center lg:justify-start rounded-xl'
					>
						<div className='flex self-start my-4 px-2 pl-[1rem] lg:pl-[2rem] lg:pt-[1rem] lg:px-0'>
							<Image src={hibiz} alt='hibiz' height={14} width={67.3} className='lg:hidden' />
							<Image
								src={hibiz}
								alt='hibiz'
								height={35}
								width={90}
								className='hidden lg:inline-flex'
							/>
						</div>
						<div className='lg:hidden my-[0.125rem]'>
							<Image src={hikitchenDish} alt='hikitchen' height={103} width={136} />
						</div>
						<div className='hidden lg:inline-flex'>
							<Image src={hikitchenDishLG} alt='hikitchen' height={107} width={372.345} />
						</div>
						<div className='mt-3 mb-3 mr-[0.125rem] lg:pt-2 lg:px-3'>
							<p className='text-[#131540] text-sm font-normal opacity-50 lg:text-lg'>
								Our system is entirely mobile-friendly, putting complete restaurant management at
								your fingertips. Your restaurant&apos;s success, simplified.
							</p>
						</div>
						{/* <div className='pl-[1rem] mb-3 flex self-start lg:pl-[2rem] lg:px-0'>
							<button className='bg-[#455F50] rounded-2xl p-1'>
								<Image src={rightArrow} alt='right_arrow' height={20} width={20} />
							</button>
						</div> */}
					</div>
				</div>
			</div>
			<a
				href='//api.whatsapp.com/send?phone=919177914130&text=Hi, i would like to know more about Hipal'
				target='_blank'
				rel='noreferrer noopener'
			>
				<div className='mx-8 lg:mx-[5.75rem] lg:w-[22.18rem] lg:mr-[5.75rem] lg:h-[5rem] rounded-3xl my-10 px-[3.25rem] py-2 bg-[#F2634C] flex flex-row justify-center items-center'>
					<button className='text-white text-sm font-normal lg:text-lg'>
						Get full managment suite
					</button>
					<div className='lg:hidden'>
						<HiChevronRight size={18} color='#fff' />
					</div>
					<div className='hidden lg:inline-flex'>
						<HiChevronRight size={20} color='#fff' />
					</div>
				</div>
			</a>
		</div>
	)
}

export default CardSection
