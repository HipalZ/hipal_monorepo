import React, { useState } from 'react'
import { BsTypeStrikethrough } from 'react-icons/bs'
import { useActiveClass } from '@components/store/useActiveClass'
import QuickFilterPopup from '../quickFilterPopup'
import { MdOutlineFilterAlt } from 'react-icons/md'
import Image from 'next/image'
import Mixed from '@assets/svg/Mixed.svg'

function QuickFilter() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const openModal = async () => {
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
	}
	const handleFilter = (str: string) => {
		setActiveDishType(str)
		setTimeout(() => {
			setIsModalOpen(false)
		}, 200)
	}
	const { setActiveDishType, isActiveDishType } = useActiveClass()

	const foodTypeIcons = {
		veg: (
			<div className='p-1'>
				<div className='w-4 h-4 p-[0.125rem] border-2 border-green-900'>
					<div className='w-[0.525rem] h-[0.525rem] bg-green-900 rounded-full'></div>
				</div>
			</div>
		),
		nonveg: (
			<div className='p-1'>
				<div className='w-4 h-4 p-[0.125rem] border-2 border-red-900'>
					<div className='w-[0.525rem] h-[0.525rem] bg-red-900 rounded-full'></div>
				</div>
			</div>
		),
		vegan: (
			<div className='p-1'>
				<div className='w-4 h-4 p-[0.125rem] border-2 border-[#02614b]'>
					<div className='w-[0.525rem] h-[0.525rem] bg-[#02614b] rounded-full'></div>
				</div>
			</div>
		),
		egg: (
			<div className='p-1'>
				<div className='w-4 h-4 p-[0.125rem] border-2 border-[#D2C903]'>
					<div className='w-[0.525rem] h-[0.525rem] bg-[#D2C903] rounded-full'></div>
				</div>
			</div>
		),
		mixed: (
			<div className='flex flex-row -mt-2 -mb-8'>
				<Image src={Mixed} width={20} height={4} alt='mixed' />
			</div>
		),
	}

	const activeIcon = foodTypeIcons[isActiveDishType.toLowerCase()] || (
		<MdOutlineFilterAlt className='text-2xl text-primary' />
	)

	return (
		<div className=''>
			<div
				onClick={openModal}
				className='text-primary text-xs ml-8 mt-auto font-semibold no-underline border border-primary px-3 rounded-[15px]'
			>
				{activeIcon}
			</div>
			{isModalOpen && (
				<QuickFilterPopup show={isModalOpen} onClose={closeModal}>
					<div className='pt-4 pb-8 w-[40vw] text-base-content bg-base-100 rounded-xl'>
						<div className='flex justify-start mx-4 text-xl text-primary'>Filters</div>

						<div className='mx-[1rem] text-center justify-center mt-4 space-y-4 font-medium'>
							{/* Quick filter options */}
							<div
								className={`${
									isActiveDishType.toLowerCase() === 'veg' ? 'bg-base-200/50 font-bold' : ''
								} flex justify-start  rounded-lg px-2 pt-2 py-1`}
								onClick={() => handleFilter('veg')}
							>
								<div className='w-5 h-5 p-[0.125rem] border-2 border-green-900'>
									<div className='w-[0.725rem] h-[0.725rem] bg-green-900 rounded-full'></div>
								</div>
								<div className={`${isActiveDishType.toLowerCase() === 'veg' ? 'font-bold' : ''} ml-3`}>Veg</div>
							</div>
							<div
								className={`${
									isActiveDishType === 'nonVeg' ? 'bg-base-200/50 font-bold' : ''
								} flex justify-start  rounded-lg px-2 pt-2 py-1`}
								onClick={() => handleFilter('nonveg')}
							>
								<div className='w-5 h-5 p-[0.125rem] border-2 border-red-900'>
									<div className='w-[0.725rem] h-[0.725rem] bg-red-900 rounded-full'></div>
								</div>
								<div className={`${isActiveDishType.toLowerCase() === 'nonveg' ? 'font-bold' : ''} ml-3`}>
									Non Veg
								</div>
							</div>
							<div
								className={`${
									isActiveDishType.toLowerCase() === 'vegan' ? 'bg-base-200/50 font-bold' : ''
								} flex justify-start rounded-lg px-2 pt-2 py-1`}
								onClick={() => handleFilter('vegan')}
							>
								<div className='w-5 h-5 p-[0.125rem] border-2 border-[#02614b]'>
									<div className='w-[0.725rem] h-[0.725rem] bg-[#02614b] rounded-full'></div>
								</div>
								<div className={`${isActiveDishType.toLowerCase() === 'vegan' ? 'font-bold' : ''} ml-3`}>
									Vegan
								</div>
							</div>
							<div
								className={`${
									isActiveDishType.toLowerCase() === 'egg' ? 'bg-base-200/50 font-bold' : ''
								} flex justify-start rounded-lg px-2 pt-2 py-1`}
								onClick={() => handleFilter('egg')}
							>
								<div className='w-5 h-5 p-[0.125rem] border-2 border-[#D2C903]'>
									<div className='w-[0.725rem] h-[0.725rem] bg-[#D2C903] rounded-full'></div>
								</div>
								<div className={`${isActiveDishType.toLowerCase() === 'egg' ? 'font-bold' : ''} ml-3`}>Egg</div>
							</div>

							<div
								className={`${
									isActiveDishType === 'ALL' ? 'bg-base-200/50 font-bold' : ''
								} flex justify-start px-2 pt-2 py-1 rounded-lg`}
								onClick={() => handleFilter('all')}
							>
								<div>
									<BsTypeStrikethrough className='text-xl text-primary/50' />
								</div>
								<div className={`${isActiveDishType === 'ALL' ? 'font-bold' : ''} ml-3`}>None</div>
							</div>
						</div>
					</div>
				</QuickFilterPopup>
			)}
		</div>
	)
}

export default QuickFilter

