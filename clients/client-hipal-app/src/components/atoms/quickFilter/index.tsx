import React, { memo, useCallback, useState } from "react"
import { useActiveClass } from "@/components/store/useActiveClass"
import QuickFilterPopup from "../quickFilterPopup"
import Image from "next/image"
import Mixed from "@/assets/svg/Mixed.svg"
import { FaCaretDown } from "react-icons/fa";

export const foodTypeIcons = {
		
	vegan: (
		<div className="w-4 h-4 p-[0.125rem] border-2 border-[#02614b]">
			<div className="w-[0.5rem] h-[0.5rem] bg-[#02614b] rounded-full"/>
		</div>
	),
	egg: (
		<div className="w-4 h-4 p-[0.125rem] border-2 border-[#D2C903]">
			<div className="w-[0.5rem] h-[0.5rem] bg-[#D2C903] rounded-full"/>
		</div>
	),
	mixed: (
		<div className="flex flex-row -mt-2 -mb-8">
			<Image src={Mixed} width={20} height={4} alt="mixed" />
		</div>
	),
	all: <div className="flex items-center"><FaCaretDown size={20} />Filter</div>
}


const FilterOption = ({ isActive, onClick, color, label, isNone = false }) => (
	<div
		className={`${isActive ? 'bg-white' : ''} flex justify-center items-center px-2 rounded-full py-2 border border-primary `}
		onClick={onClick}
	>
		<div className="w-4 h-4 p-[0.125rem] border-2" style={{ borderColor: color }}>
			{!isNone ? (
				<div className="w-[0.5rem] h-[0.5rem] rounded-full" style={{ backgroundColor: color }}/>
			) : (
				<></>
			)}
		</div>
		<div className='ml-1 text-[0.75rem]'>{label}</div>
	</div>
)

const QuickFilter = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { setActiveDishType, isActiveDishType } = useActiveClass()

	const openModal = useCallback(() => {
		setIsModalOpen(true)
	}, [])

	const closeModal = useCallback(() => {
		setIsModalOpen(false)
	}, [])

	const handleFilter = useCallback((str: string) => {
		if (isActiveDishType.toLowerCase() === str.toLowerCase()) {
			setActiveDishType("all")
			setIsModalOpen(false)
			return
		}
		setActiveDishType(str)
		setIsModalOpen(false)
	}, [setActiveDishType, isActiveDishType])

	
	const activeIcon = foodTypeIcons[isActiveDishType.toLowerCase()] || (
	<div className="flex items-center"><FaCaretDown size={20} /> Filter</div>
	)

	return (
		<div>
			<section className="flex space-x-2 text-xs justify-evenly text-nowrap">
				<FilterOption
					isActive={isActiveDishType.toLowerCase() === "veg"}
					onClick={() => handleFilter("veg")}
					color="#55CB1E"
					label="Veg"
				/>
				<FilterOption
					isActive={isActiveDishType.toLowerCase() === "nonveg"}
					onClick={() => handleFilter("nonveg")}
					color="#FF6363"
					label="Non Veg"
				/>
				<div
					onClick={openModal}
					className="p-2 ml-2 text-xs font-semibold border rounded-full text-primary border-primary"
				>
					{activeIcon}
				</div>
			</section>
			{isModalOpen && (
				<QuickFilterPopup show={isModalOpen} onClose={closeModal}>
					<div className="pt-4 pb-8 w-[7rem] text-base-content bg-base-100 rounded-xl mb-4">
						<div className="mb-4 text-xl text-center text-primary">Filters</div>
						<div className="mx-[1rem]  font-medium space-y-4">
							<FilterOption
								isActive={isActiveDishType.toLowerCase() === "vegan"}
								onClick={() => handleFilter("vegan")}
								color="#02614b"
								label="Vegan"
							/>
							<FilterOption
								isActive={isActiveDishType.toLowerCase() === "egg"}
								onClick={() => handleFilter("egg")}
								color="#D2C903"
								label="Egg"
							/>
							<FilterOption
								isActive={isActiveDishType === "all"}
								onClick={() => handleFilter("all")}
								color="transparent"
								label="None"
								isNone
							/>
						</div>
					</div>
				</QuickFilterPopup>
			)}
		</div>
	)
}

const MemoQuickFilter = memo(QuickFilter)
export default MemoQuickFilter
