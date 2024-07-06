import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/image"
import PlaceholderImg from "@/components/atoms/placeholder"
import FoodType, { type FOOD_TYPES } from "@/components/atoms/foodType"
import type { IDish } from "@/components/types/businessData"
import { memo } from "react"

function DiscountDishCard({
	dishData,
	onClick,
}: {
	dishData: IDish
	onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}) {
	return (
		<center className="relative flex flex-col w-32 no-scrollbar" onClick={onClick}>
			<div className="absolute z-50 scale-75 bg-white rounded-md left-1 top-1">
				<FoodType type={dishData.dishType as FOOD_TYPES} />
			</div>
			<div className="z-10 flex overflow-hidden rounded-xl border-1 border-base-content">
				{dishData?.images && dishData.images[0] ? (
					<div className="w-32 h-[10rem] rounded-2xl">
						<Image
							src={dishData.images[0]}
							width={132}
							height={200}
							quality={95}
							className="h-[10rem] w-full rounded-t-2xl object-cover"
							alt={"text"}
							placeholder="blur"
							blurDataURL={getRandomBlurImg(150, 150)}
						/>
					</div>
				) : (
					<PlaceholderImg className="w-32 h-full" />
				)}
			</div>
			{/* Bottom Section */}
			<div className="flex w-32 mt-2 overflow-hidden text-sm text-center truncate">
				{dishData?.name}
			</div>
		</center>
	)
}

const MemoizedDiscountDishCard = memo(DiscountDishCard)
export default MemoizedDiscountDishCard
