import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/legacy/image"
import PlaceholderImg from "@/components/atoms/placeholder"
import FoodType, { FOOD_TYPES } from "@/components/atoms/foodType"
import { IDish } from "@/components/types/businessData"

function DiscountDishCard({
	dishData,
	onClick,
}: {
	dishData: IDish
	onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}) {
	return (
		<center className="relative flex flex-col w-32" onClick={onClick}>
			<div className="absolute z-50 scale-75 bg-white rounded-md left-1 top-1">
				<FoodType type={dishData.dishType as FOOD_TYPES} />
			</div>
			<div className="z-10 flex overflow-hidden bg-cover rounded-xl border-1 border-base-content">
				{dishData?.images && dishData.images[0] ? (
					<div className="w-32 h-[9rem] rounded-2xl">
						<Image
							src={dishData.images[0]}
							width={132}
							height={150}
							quality={95}
							objectFit="cover"
							className=""
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
			<div className="flex mt-2 overflow-hidden text-sm text-center truncate w-32">
				{dishData?.name}
			</div>
		</center>
	)
}

export default DiscountDishCard
