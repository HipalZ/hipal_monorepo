import MainTypes from "@/components/molecules/categoryTypes/mainTypes"
import SubTypes from "@/components/molecules/categoryTypes/subTypes"
import type { CategoryType } from "@hi/db-models/src/validators"
import { memo } from "react"

function DishesTypes({
	parentCategory,
	childCategory,
}: {
	parentCategory: CategoryType[],
	childCategory: CategoryType[],
}) {

	console.log("this is inside DishesTypes", parentCategory, childCategory);
	
	return (
		<section className="sticky z-50 -top-1">
			<MainTypes parentCategory={parentCategory}/>
			<SubTypes childCategory={childCategory} />
		</section>
	)
}

const MemoDishesTypes = memo(DishesTypes)
export default MemoDishesTypes
