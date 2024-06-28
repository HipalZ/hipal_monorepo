"use client"
import HorizontalCard from "@/components/atoms/card/horizontalCard"
import { useDishTypes } from "@/components/store/useDishTypes"
import { useMemo } from "react"
import { useActiveClass } from "@/components/store/useActiveClass"

import { ICategories, ICategory, ICategorySubTypes, ICategoryTypes, IDish } from "@/components/types/businessData"

interface IDishesProps {
	allCategoriesTypes?: {
		main: ICategoryTypes
		sub: ICategorySubTypes
	}
	categories: ICategories[],

}

const DishesList: React.FC<IDishesProps> = (props) => {
	const { allCategoriesTypes, categories } = props;
	console.log(allCategoriesTypes, categories)
	const setActiveCategory = useActiveClass((s) => s.setActiveCategory);
	const { isActiveDishType } = useActiveClass();
	const setActiveParentCategory = useActiveClass((s) => s.setActiveParentCategory);
  
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
		filteredDishes.forEach((category) => {
		  const parentCategory = category.parentCategory || 'Others';
		  if (!group[parentCategory]) {
			group[parentCategory] = {
			  parentCategoryName: parentCategory,
			  categories: [],
			};
		  }
		  group[parentCategory].categories.push(category);
		});
		return Object.values(group);
	  }, [filteredDishes]);
  
	return (
	  <div>
		{groupedCategories.map((group) => (
		  <div key={group?.parentCategoryName}>
			<div className="p-2 font-bold bg-primary text-base-100 rounded-t-3xl">
			  <center className="m-2 text-xl font-medium capitalize">{group?.parentCategoryName}</center>
			</div>
			{group?.categories?.map((category, index) => {
			  if (category?.dishes?.length === 0) return null;
			  return (
				<section
				  className={`min-h-60 ${isTopScrollWithSubTypes ? 'scroll-mt-[15rem]' : 'scroll-mt-[13.2rem]'} bg-base-100 w-full pb-4`}
				  id={category._id}
				  key={category._id + `${index}`}
				  onTouchStart={() => handleTouchStart(category._id, category?.parentCategoryId || '')}
				>
				  <div className={`${category.dishes.length === 0 ? '' : 'border-t-2 border-primary'} z-40 flex flex-row justify-between px-6 pb-2 font-bold prose bg-base-200/50 text-base-content`}>
					<h3 className="my-4 text-xl font-medium capitalize text-primary">{category?.name || ''}</h3>
					<h4 className="my-4 text-lg font-medium text-primary">{category?.dishes?.length}</h4>
				  </div>
				  <div className="flex flex-col divide-y divide-base-content/20">
					{category?.dishes.length > 0 &&
					  category?.dishes.map((dishData:IDish, dishIndex) => (
						dishData?.visibility && (
						  <div key={`${dishData?._id}${dishIndex}`}>
							<HorizontalCard dishData={dishData} isTopScrollWithSubTypes={isTopScrollWithSubTypes} />
						  </div>
						)
					  ))}
				  </div>
				</section>
			  );
			})}
		  </div>
		))}
	  </div>
	);
  };
  
  export default DishesList;
