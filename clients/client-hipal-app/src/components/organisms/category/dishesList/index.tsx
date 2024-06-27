"use client"
import HorizontalCard from "@/components/atoms/card/horizontalCard"
import { useDishTypes } from "@/components/store/useDishTypes"
import { memo, useMemo } from "react"
import { useActiveClass } from "@/components/store/useActiveClass"
import { GiKnifeFork } from "react-icons/gi"
import { ICategories, ICategory, ICategorySubTypes, ICategoryTypes } from "@/components/types/businessData"

interface IDishesProps {
	allCategoriesTypes?: {
		main: ICategoryTypes
		sub: ICategorySubTypes
	}
	categories: ICategories[],

}

const DishesList = (props: IDishesProps) =>{
	const { allCategoriesTypes, categories } = props
	const setActiveCategory = useActiveClass((s) => s.setActiveCategory)
	let { isActiveDishType } = useActiveClass()
	const setActiveParentCategory = useActiveClass((s) => s.setActiveParentCategory)

	const filteredDishes = useMemo(() => categories?.map((category) => ({
		...category,
		dishes: category?.dishes?.filter((dish) => {
			const dishTypeLower = dish?.dishType?.toLowerCase().replace(/[_-]/g, "");
			const activeDishTypeLower = isActiveDishType?.toLowerCase().replace(/[_-]/g, "");
			switch (activeDishTypeLower) {
				case "all":
					return true;
				case "veg":
					return dishTypeLower === "veg" || dishTypeLower === "mixed";
				case "nonveg":
					return dishTypeLower === "nonveg" || dishTypeLower === "mixed";
				case "vegan":
					return dishTypeLower === "vegan";
				case "egg":
					return dishTypeLower === "egg";
				default:
					return false;
			}
		}),
	})), [categories, isActiveDishType]);
	
	const activeDishTypes = useDishTypes((s) => s.activeDishTypes)
	const subTypes = useMemo(() => {
		if (!!activeDishTypes.activeMainType === false) return null

		return allCategoriesTypes?.sub?.[activeDishTypes?.activeMainType || ""] || null
	}, [activeDishTypes.activeMainType, allCategoriesTypes?.sub])

	const isTopScrollWithSubTypes = useMemo(() => !!subTypes, [subTypes])

	const handleTouchStart = (categoryId: string, parentCategoryId: string) => {
		setActiveCategory(categoryId);
		setActiveParentCategory(parentCategoryId || categoryId);
	};

	if (!categories) {
		return <div className="my-5 prose text-center"><h4>No Dishes found.</h4></div>;
	}

	return (
		<div>
			{filteredDishes.length > 0 &&
				filteredDishes
					.filter((item: ICategory) => item?.visibility)
					.map((category, index) => {
						return (
							<section
								className={`min-h-60  ${isTopScrollWithSubTypes ? "scroll-mt-[15rem]" : "scroll-mt-[11.2rem]"
									} bg-base-100 w-full pb-4`}
								id={category._id}
								key={category._id + `${index}`}
								onTouchStart={() => handleTouchStart(category._id, category?.parentCategoryId || '')}
							>
								<div
									className={`${category.dishes.length === 0 ? "" : "border-t-2 border-primary"
										} z-40 flex flex-row px-6 pb-2 font-bold prose bg-base-200/50 text-base-content`}
								>
									<div className="my-auto ">
										{category.dishes.length === 0 ? (
											<h3 className="my-4 text-lg font-medium capitalize text-primary">
												{category?.name || ""}
											</h3>
										) : (
											<h3 className="my-4 text-xl font-medium capitalize text-primary">
												{category?.name || ""}
											</h3>
										)}

										{category.dishes.length === 0 ? (
											<div className="flex mb-2 ml-2 -mt-4">
												<div className="mt-2">
													<GiKnifeFork />
												</div>
												<div className="ml-2 mt-[0.125rem]">
													No items found, Try change the filter !
												</div>
											</div>
										) : (
											""
										)}
									</div>

									<div className="my-auto ml-auto">
										<h4 className="my-4 text-lg font-medium text-primary">
											{category?.dishes?.length}
										</h4>
									</div>
								</div>
								<div className="flex flex-col divide-y divide-base-content/20">
									{category?.dishes.length > 0 &&
										category?.dishes.map((dishData, index) => {
											return (
												dishData?.visibility && (
													<div key={`${dishData?._id}${index}`}>
														<HorizontalCard
															dishData={dishData}
															isTopScrollWithSubTypes={isTopScrollWithSubTypes}
														/>
													</div>
												)
											);
										})}
								</div>
							</section>
						)
					})}
		</div>
	)
}

export default DishesList
