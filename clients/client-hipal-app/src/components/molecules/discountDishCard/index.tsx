import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/legacy/image"
import PlaceholderImg from "@/components/atoms/placeholder"
import FoodType, { FOOD_TYPES } from "@/components/atoms/foodType"
import { IDish } from "@/components/types/businessData"

function DiscountDishCard({
	dishData,
	onClick,
}: {
	dishData:IDish
	onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}) {
	return (
		<button className="relative flex flex-col px-0 h-52 btn btn-lg btn-ghost" onClick={onClick}>
			<div className="absolute z-50 scale-75 bg-white rounded-md left-1 top-3">
				<FoodType type={dishData.dishType as FOOD_TYPES} />
			</div>
			<div className="z-10 flex h-40 overflow-hidden bg-cover rounded-xl border-1 border-base-content">
				{dishData?.images && dishData.images[0] ? (
					<Image
						src={dishData.images[0]}
						width={120}
						height={100}
						quality={75}
						objectFit="cover"
						className=""
						alt={"text"}
						placeholder="blur"
						blurDataURL={getRandomBlurImg(150, 150)}
					/>
				) : (
					<PlaceholderImg className="w-32 h-full" />
				)}
			</div>
			{/* Bottom Section */}
			<div className="flex w-full mt-2 overflow-hidden text-sm">
				{dishData?.name?.length > 15 ? (
					<div className="text-sm font-semibold tracking-wider text-left capitalize">
						{`${dishData?.name.slice(0, 14)}..`}
					</div>
				) : (
					<div className="text-sm font-semibold tracking-wider text-left capitalize">
						{dishData?.name}
					</div>
				)}
			</div>
		</button>
	)
}

export default DiscountDishCard
