"use client"
import HorizontalCard from "@/components/atoms/card/horizontalCard"
import { useDishTypes } from "@/components/store/useDishTypes"
import { memo, useEffect, useMemo } from "react"
import { useActiveClass } from "@/components/store/useActiveClass"

import type { ICategories, ICategory, ICategorySubTypes, ICategoryTypes, IDish } from "@/components/types/businessData"
import { useRouter } from "next/navigation"

interface IDishesProps {
	allCategoriesTypes?: {
		main: ICategoryTypes
		sub: ICategorySubTypes
	}
	categories: ICategories[],

}

const DishesList: React.FC<IDishesProps> = (props) => {
	const { allCategoriesTypes, categories } = props;
	const { isActiveDishType, setActiveCategory, setActiveParentCategory } = useActiveClass((state) => ({
		setActiveCategory: state.setActiveCategory,
		setActiveParentCategory: state.setActiveParentCategory,
		isActiveDishType: state.isActiveDishType,
	  }));

	  const router = useRouter();

	  useEffect(() => {
		const handleHashChange = () => {
		  const { hash } = window.location;
		  if (hash) {
			const categoryId = hash.substring(1); 
			const element = document.getElementById(categoryId);
			if (element) {
			  element.scrollIntoView({ behavior: "smooth" });
			}
		  }
		};
	
		handleHashChange(); 
	
		window.addEventListener("hashchange", handleHashChange); 
	
		return () => {
		  window.removeEventListener("hashchange", handleHashChange); 
		};
	  }, [router,isActiveDishType]);

	const filteredDishes = useMemo(() => categories?.map((category) => ({
		...category,
		dishes: category?.dishes?.filter((dish) => {
			const dishTypeLower = dish?.dishType?.toLowerCase().replace(/[_-]/g, '');
			const activeDishTypeLower = isActiveDishType?.toLowerCase().replace(/[_-]/g, '');
			switch (activeDishTypeLower) {
				case 'all':
					return true;
				case 'veg':
					return dishTypeLower === 'veg' || dishTypeLower === 'mixed';
				case 'nonveg':
					return dishTypeLower === 'nonveg' || dishTypeLower === 'mixed';
				case 'vegan':
					return dishTypeLower === 'vegan';
				case 'egg':
					return dishTypeLower === 'egg';
				default:
					return false;
			}
		}),
	})), [categories, isActiveDishType]);

	const activeDishTypes = useDishTypes((s) => s.activeDishTypes);
	const subTypes = useMemo(() => {
		if (!!activeDishTypes.activeMainType === false) return null;
		return allCategoriesTypes?.sub?.[activeDishTypes?.activeMainType || ''] || null;
	}, [activeDishTypes.activeMainType, allCategoriesTypes?.sub]);

	const isTopScrollWithSubTypes = useMemo(() => !!subTypes, [subTypes]);

	const handleTouchStart = (categoryId: string, parentCategoryId: string) => {
		setActiveCategory(categoryId);
		setActiveParentCategory(parentCategoryId || categoryId);
	};

	if (!categories) {
		return (
			<div className="my-5 prose text-center">
				<h4>No Dishes found.</h4>
			</div>
		);
	}

	// Group categories by their parent category
	const groupedCategories = useMemo(() => {
		const group: { [key: string]: { parentCategoryName: string; categories: ICategory[] } } = {};
		for (const category of filteredDishes) {
			const parentCategory = category.parentCategory || 'Others';
			if (!group[parentCategory]) {
				group[parentCategory] = {
					parentCategoryName: parentCategory,
					categories: [],
				};
			}
			if (category.dishes && category.dishes.length > 0) {
				group[parentCategory].categories.push(category);
			}
		}
		return Object.values(group).filter((group) => group.categories.length > 0);
	}, [filteredDishes]);

	return (
		<div>
			{groupedCategories.map((group) => (
				<div key={group?.parentCategoryName}>
					<div className="p-2 font-bold bg-primary text-base-100 rounded-t-3xl">
						<center className="m-2 text-xl font-medium capitalize">{group?.parentCategoryName}</center>
					</div>
					{group?.categories.map((category, index) => (
						<section
							className={`min-h-60 ${isTopScrollWithSubTypes ? 'scroll-mt-[15rem]' : 'scroll-mt-[13.2rem]'} bg-base-100 w-full pb-4`}
							id={category._id}
							key={`${category._id}${index}`}
							onTouchStart={() => handleTouchStart(category._id, category?.parentCategoryId || '')}
						>
							<div className={`${category.dishes.length === 0 ? '' : 'border-t-2 border-primary'} z-40 flex flex-row justify-between px-6 pb-2 font-bold prose bg-base-200`}>
								<h3 className="my-4 text-xl font-medium capitalize text-primary">{category?.name || ''}</h3>
								<h4 className="my-4 text-lg font-medium text-primary">{category?.dishes?.length}</h4>
							</div>
							<div className="flex flex-col divide-y divide-base-base-300">
								{category?.dishes.map((dishData: IDish, dishIndex) => (
									dishData?.visibility && (
										<div key={`${dishData?._id}${dishIndex}`}>
											<HorizontalCard dishData={dishData} isTopScrollWithSubTypes={isTopScrollWithSubTypes} />
										</div>
									)
								))}
							</div>
						</section>
					))}
				</div>
			))}
		</div>
	);
};

const MemoDishesList = memo(DishesList);
export default MemoDishesList;
