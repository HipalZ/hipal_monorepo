import DishTag from "@/components/atoms/dishTag"
import FoodType, { FOOD_TYPES } from "@/components/atoms/foodType"
import ReadMore from "@/components/atoms/readMore"
import { IDish } from "@/components/types/businessData"
import { getPrice } from "@/components/utils/helpers"
import { isEmpty } from "lodash-es"
import { memo } from "react"
import { MdOutlineRiceBowl } from "react-icons/md"
import DishQuantityButton from "../dishQuantityButton"
import { BsFillCircleFill } from "react-icons/bs"
import { IoFastFoodSharp } from "react-icons/io5"

function FoodDescription({ dishData }: { dishData: IDish }) {
	const isAvailable = dishData?.availability
	return (
			<div className="flex flex-col !mt-0 space-y-4 no-scrollbar">
				<div className="flex flex-col">
					<div className="flex flex-row flex-wrap flex-1 w-full">
						{dishData?.dishType && (
							<div className="my-auto">
								<FoodType type={dishData?.dishType as FOOD_TYPES} />
							</div>
						)}

						<DishTag tags={dishData?.tags} />

						{isAvailable && (
							<div className="my-1 ml-auto shrink-0">
								<DishQuantityButton dishData={dishData} />
							</div>
						)}
						<div
							className={`w-full font-medium mt-1 
        ${dishData?.name?.length > 30 ? "text-lg" : "text-xl"}
        ${isAvailable ? " -mt-1" : "mt-2"}`}
						>
							{dishData?.name || ""}
						</div>
						<div className="my-2">
							<span className="text-base">{getPrice(dishData?.price || 0)}</span>
						</div>
					</div>
					{/* Descrption */}
					{dishData?.description && (
						<div className="text-xs leading-3">
							<ReadMore text={dishData?.description || ""} />
						</div>
					)}
				</div>

				{!isEmpty(dishData?.portions) && (
					<div className="flex flex-col mt-1 space-y-5">
						<div className="flex flex-row gap-4 text-base text-primary">
							<MdOutlineRiceBowl className="my-auto" />
							<h4 className="my-auto">{dishData?.portions?.length} Portions available</h4>
						</div>

						<div className="flex flex-row flex-wrap w-full gap-px divide-base-content bg-base-content/10">
							{dishData?.portions.map((portion, key) => (
								<div
									key={key}
									className={
										"flex flex-col min-w-[22%] max-w-full mx-auto space-y-1 text-base text-center bg-base-100 flex-grow p-2"
									}
								>
									<span className="text-sm font-normal text-base-content">{portion?.name}</span>
									<span className="text-xs font-thin text-base-content">
										{getPrice(portion?.price)}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{!isEmpty(dishData?.extras?.[0]?.items) && (
					<div className="flex flex-col pt-1 space-y-5">
						<div className="flex flex-row gap-4 text-base text-primary">
							<IoFastFoodSharp className="my-auto text-xl" />
							<h4 className="my-auto">Extras available</h4>
						</div>

						{dishData?.extras.map((extra, key) => (
							<div key={extra.name} className="space-y-3">
								<h6 className="text-sm ">
									{key + 1}. {extra?.name}
								</h6>

								<ul className="grid justify-start grid-cols-2 px-1 py-2 border rounded-lg flex-col-2 border-base-content/20">
									{extra?.items.map((item) => (
										<li
											key={item?.name}
											className="flex flex-row gap-2 py-2 text-sm font-normal opacity-60 min-w-fit text-base-content"
										>
											<BsFillCircleFill className="inline-flex p-1 my-auto text-xs" />
											<span className="my-auto text-sm text-start">{item?.name}</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				)}
			</div>
	)
}

const MemoFoodDescription = memo(FoodDescription)
export default MemoFoodDescription
