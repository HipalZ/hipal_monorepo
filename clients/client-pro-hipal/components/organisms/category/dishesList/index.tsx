import { _useAllBusiness } from "@components/store/useAllBusiness";
import { useDishTypes } from "@components/store/useDishTypes";
import { memo, useEffect, useMemo } from "react";
import { useActiveClass } from "@components/store/useActiveClass";
import { GiKnifeFork } from "react-icons/gi";
import type { ICategory } from "@components/types/businessData";
import dynamic from "next/dynamic";

const HorizontalCard = dynamic(
	() => import("@components/atoms/card/horizontalCard"),
	{
		ssr: false,
	},
);

function DishesList() {
	const setActiveCategory = useActiveClass((s) => s.setActiveCategory);
	const data = _useAllBusiness((s) => s.data);
	const allCategoriesTypes = useMemo(
		() => data?.allCategoriesTypes,
		[data?.allCategoriesTypes],
	);
	const categories = useMemo(() => data?.categories || [], [data?.categories]);
	const { isActiveDishType } = useActiveClass();
	const setActiveParentCategory = useActiveClass(
		(s) => s.setActiveParentCategory,
	);
	const setActiveParentCategoryName = useActiveClass(
		(s) => s.setActiveParentCategoryName,
	);

	const filteredDishes = categories.map((category) => ({
		...category,
		dishes: category.dishes.filter((dishData) => {
			const dishTypeLower = dishData.dishType
				.toLowerCase()
				.replace(/[_-]/g, ""); // Normalize the string
			const activeDishTypeLower = isActiveDishType
				.toLowerCase()
				.replace(/[_-]/g, "");

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
	}));

	const activeDishTypes = useDishTypes((s) => s.activeDishTypes);
	const subTypes = useMemo(() => {
		if (!!activeDishTypes.activeMainType === false) return null;

		return (
			allCategoriesTypes?.sub?.[activeDishTypes?.activeMainType || ""] || null
		);
	}, [activeDishTypes.activeMainType, allCategoriesTypes?.sub]);

	const isTopScrollWithSubTypes = useMemo(() => !!subTypes, [subTypes]);

	useEffect(() => {
		if (window.location.hash) {
			const hash = window.location.hash.substring(1);
			const element = document.getElementById(`${hash}`);
			if (element) {
				element.scrollIntoView();
			}
		}
	}, []);
	if (!categories) {
		return (
			<>
				<div className="my-5 prose text-center">
					<h4>No Dishes found.</h4>
				</div>
			</>
		);
	}

	return (
		<div>
			{filteredDishes.length > 0 &&
				filteredDishes
					.filter((item: ICategory) => item?.visibility)
					.map((category, index) => {
						return (
							<section
								className={`min-h-60 bg-base-100 ${
									isTopScrollWithSubTypes
										? "scroll-mt-[15rem]"
										: "scroll-mt-[11.2rem]"
								}  w-full pb-4`}
								id={category._id}
								key={index}
								onTouchStart={(e) => {
									setActiveCategory(category._id);
									setActiveParentCategory(
										category?.parentCategoryId
											? category?.parentCategoryId
											: category._id,
									);
									setActiveParentCategoryName(
										category?.parentCategory
											? category?.parentCategory
											: category.name,
									);
								}}
							>
								<div
									className={`${
										category.dishes.length === 0
											? ""
											: "border-t-2 border-primary"
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
											{category.dishes.length}
										</h4>
									</div>
								</div>

								<div className="flex flex-col divide-y divide-base-content/20">
									{category.dishes.length > 0 &&
										category.dishes.map(
											(dishData, index) =>
												dishData.visibility && (
													<div key={`${dishData?._id}${index}`}>
														<HorizontalCard
															dishData={dishData}
															isTopScrollWithSubTypes={isTopScrollWithSubTypes}
														/>
													</div>
												),
										)}
								</div>
							</section>
						);
					})}
		</div>
	);
}

export default memo(DishesList);
