import FoodDescription from "@/components/organisms/dishDescription/foodDiscription"
import WallpaperCarousel from "@/components/atoms/backgroundCarousel"
import { isEmpty } from "lodash-es"
import NotAvailable from "../notAvailable"
import PlaceholderImg from "../placeholder"
import type { IDish } from "@/components/types/businessData"
import { memo } from "react"

function DishPopup({ dishData }:{dishData: IDish}) {
	const isAvailable = dishData?.availability
	const handleInsideClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation()
	}

	return (
		<div className="relative max-h-[70vh] overflow-y-auto text-primary" onClick={(e) => handleInsideClick(e)}>
			{!isEmpty(dishData?.images) ? (
				<div className="rounded-full">
					<WallpaperCarousel wallpapers={dishData?.images} isAvailable={isAvailable} />
				</div>
			) : !isAvailable ? (
				<div className="pb-2 text-center">
					<NotAvailable className="w-full h-32 overflow-hidden rounded-xl" />
				</div>
			) : (
				<div className="pb-4">
					
					<PlaceholderImg className='w-full h-[10rem]' />
				</div>
			)}

			<FoodDescription dishData={dishData} />
		</div>
	)
}

const MemoDishPopup = memo(DishPopup)
export default MemoDishPopup