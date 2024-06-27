import DishTag from "@/components/atoms/dishTag"
import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton"
import type {  IDish } from "@/components/types/businessData"
import { getPrice } from "@/components/utils/helpers"
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/legacy/image"
import { memo, useState } from "react"
import { AiOutlineRight, AiOutlineWarning } from "react-icons/ai"
import FoodType, { type FOOD_TYPES } from "../foodType"
import DishData from "../dishDescription"
import DishPopup from "../dishPopup"
import NotAvailable from "../notAvailable"
import { useCart } from "@/components/store/useCart"
import RecommendedDishes from "@/components/organisms/dishDescription/recommendedDishes"
import PlaceholderImg from "../placeholder"
import { ICat } from "@/components/molecules/searchPanel"

function HorizontalCard({
	dishData,
	noAddBtn,
	noDescription,
	isTopScrollWithSubTypes,
	redirection,
}: {
	dishData: IDish
	noAddBtn?: boolean
	noDescription?: boolean
	isTopScrollWithSubTypes?: boolean
	redirection?: (id: string, categories: ICat[]) => void
}) {
	const coverImage = dishData?.images?.[0]
	const isAvailable = dishData?.availability
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedDish, setSelectedDish] = useState({} as IDish)
	const cart = useCart((s) => s.cart)
	const isDishInCart = cart.hasOwnProperty(dishData._id)
	const openModal = (dishData:any) => {
		setSelectedDish(dishData)
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setSelectedDish({} as IDish)
		setIsModalOpen(false)
	}

	return (
		<section
			id={`${dishData?._id}`}
			className={`
  ${isAvailable ? "mx-6" : "opacity-80 px-6"}
  ${!isTopScrollWithSubTypes ? "scroll-mt-[15rem]" : "scroll-mt-[11.2rem]"}
`}
		>
			<div className="flex flex-row py-6 space-x-12 prose">
				<div className="flex flex-col py-1 my-auto mr-auto space-y-1">
					<div className="flex space-x-2 ">
						{dishData?.dishType && (
							<div className="my-auto">
								<FoodType type={dishData.dishType as FOOD_TYPES} />
							</div>
						)}
						{!isAvailable && (
							<>
								<span>
									<AiOutlineWarning className="ml-2 -mr-1 mt-[0.125rem] text-primary" />
								</span>
								<span className="ml-2 text-sm text-primary">Not available</span>
							</>
						)}

						<DishTag tags={dishData.tags} />
					</div>

					<div className="w-full overflow-hidden text-lg font-medium capitalize">
						{dishData?.name || ""}
					</div>
					<div className="mt-1 ml-1 text-xs ">
						<span className="text-base-content/80">{getPrice(dishData?.price || 0)}</span>
					</div>

					<div onClick={() => openModal(dishData)} className="flex mt-2 space-x-1 text-primary">
						<div className="underline on_active_bounce !text-sm">Know more</div>
						<div>
							<AiOutlineRight size={17} className="py-[0.125rem] mt-0.5 text-xl" />
						</div>
					</div>
				</div>
				<div className={"flex flex-col flex-shrink-0 my-auto ml-auto"}>
					<div>
						{!!coverImage ? (
							<div className="relative " onClick={() => openModal(dishData)}>
								<Image
									src={coverImage}
									layout={"intrinsic"}
									alt="dish"
									quality={75}
									width={125}
									height={122}
									objectFit="cover"
									className={`on_active_bounce !w-32 !h-32 overflow-hidden rounded-xl ${
										dishData.availability ? "" : "grayscale"
									}`}
									placeholder="blur"
									blurDataURL={getRandomBlurImg(110, 110)}
								/>
								{!isAvailable && (
									<>
										<div className="absolute z-20 text-sm text-white bottom-4 left-2">
											Not Available
										</div>
										<div className="absolute w-full bottom-2 rounded-b-2xl bg-gradient-to-t from-black via-black/70 to-transparent h-1/2"></div>
									</>
								)}
							</div>
						) : !isAvailable ? (
							<div className="pb-2">
								<NotAvailable className="w-32 h-32 overflow-hidden rounded-xl" />
							</div>
						) : noDescription ? (
							<div >
								<PlaceholderImg className="w-32 h-32 overflow-hidden rounded-xl" />
							</div>
						) : (
							<div className="mt-6" />
						)}
					</div>

					{!noAddBtn && (
							<div
								className={
									"z-20 flex flex-col  items-center w-full mx-auto " +
									(!!coverImage || noDescription ? " -mt-6" : " -mt-4 -ml-6")
								}
							>
								{isAvailable && (
									<div
										className={
											"flex flex-col flex-shrink-0 items-center w-full" +
											(!!coverImage ? "" : "-ml-6")
										}
									>
										<DishQuantityButton dishData={dishData} />
									</div>
								)}
							</div>
					)}
					{isModalOpen && (
						<DishData show={isModalOpen} onClose={closeModal}>
							<div className="relative py-4 mx-4 ">
								<DishPopup dishData={selectedDish} />
							</div>
						</DishData>
					)}
				</div>
			</div>
			{/* <div>{isDishInCart && <RecommendedDishes dishData={dishData} openModal={openModal} />}</div> */}
		</section>
	)
}

export default memo(HorizontalCard)
