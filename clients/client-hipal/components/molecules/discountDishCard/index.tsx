import { getRandomBlurImg } from "@components/utils/images"
import Image from "next/legacy/image"
import { memo } from "react"
import { BsSunFill } from "react-icons/bs"
import { MdLocalOffer } from "react-icons/md"
import { AiOutlineStar } from "react-icons/ai"

import PlaceholderImg from "@components/atoms/placeholder"
import FoodType, { FOOD_TYPES } from "@components/atoms/foodType"

function DiscountDishCard({
	businessId,
	dishData,
	onClick,
}: {
	businessId: string
	dishData
	onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}) {
	return (
		<button className="relative flex flex-col px-0 h-52 btn btn-lg btn-ghost" onClick={onClick}>
			<div className="absolute z-50 scale-75 bg-white rounded-md left-1 top-3">
				<FoodType type={dishData.dishType as FOOD_TYPES} />
			</div>
			<div className="z-10 flex h-40 overflow-hidden bg-cover rounded-xl border-1 border-base-content">
				{" "}
				{dishData?.images.length > 0 ? (
					<Image
						src={dishData?.images[0]}
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
					<>
						<div className="text-sm font-semibold tracking-wider text-left capitalize">
							{dishData?.name}
						</div>
					</>
				)}
			</div>

			{/* tag section  */}
			{dishData?.tags?.length > 0 ? (
				dishData?.tags?.slice(0, 1).map((item, index) => {
					if (item?.icon == "star_outline") {
						return (
							<div
								className={`px-3 rounded-[0.5rem] -ml-[0.9rem] py-1 text-primary text-[${item?.color}] absolute  bottom-0 left-0 text-[0.813rem]  md:text-[0.813rem]  text-xs font-medium normal-case  `}
								key={index + 1}
							>
								{/* // local_offer wb_sunny star_outline */}
								<AiOutlineStar className={"inline-flex"} /> {item?.text}
							</div>
						)
					}
					if (item?.icon == "local_offer") {
						return (
							<div
								key={index}
								className={`  rounded-lg px-3  -ml-[0.9rem] py-1 text-primary text-[${item?.color}] absolute  bottom-0 left-0 text-[0.813rem]  md:text-[0.813rem]  text-xs font-medium normal-case  `}
							>
								{/* // local_offer wb_sunny star_outline */}
								<MdLocalOffer className={"inline-flex"} /> {item?.text}
							</div>
						)
					}
					if (item?.icon == "wb_sunny") {
						return (
							<div
								key={index}
								className={` px-3 rounded-[0.5rem] -ml-[0.9rem] py-1 ${
									item?.text.length > 18 ? (item.text = item.text.slice(0, 12)) : ""
								} text-primary text-[${
									item?.color
								}] absolute  bottom-0 left-0 text-[0.813rem]  md:text-[0.813rem]  text-xs font-medium normal-case  `}
							>
								{/* // local_offer wb_sunny star_outline */}
								<BsSunFill className={"inline-flex"} /> {item?.text}
							</div>
						)
					}
				})
			) : (
				<></>
			)}

			{/* <button className='inline-flex items-center px-2 py-1 font-bold text-left text-white bg-green-500 rounded-full '>
					<svg
						className='w-4 h-4 mr-2 text-white fill-current'
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 20 20'
					>
						<path d='M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z' />
					</svg>
					<span className='text-white'>Star dish</span>
				</button> */}

			{/* Offering section */}

			{dishData?.discount && (
				<div className="absolute top-0 left-0 -mt-[0.1rem] z-10 px-3 py-1 text-xs font-bold normal-case shadow-lg bg-success text-success-content rounded-br-2xl">
					{dishData?.discount}% off
				</div>
			)}
		</button>
	)
}

export default memo(DiscountDishCard)
