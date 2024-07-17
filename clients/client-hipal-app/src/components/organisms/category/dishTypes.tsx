import MainTypes from "@/components/molecules/categoryTypes/mainTypes"
import SubTypes from "@/components/molecules/categoryTypes/subTypes"
import type { ICategory } from "@/components/types/businessData"
import { memo } from "react"

function DishesTypes({
	allCategoriesTypes,
	categories,
}: {
	allCategoriesTypes: {
		main: any
		sub: any
	},
	categories: ICategory[]
}) {
	return (
		<section className="sticky z-50 -top-1">
			<MainTypes allCategoriesTypes={allCategoriesTypes}/>
			<SubTypes allCategoriesTypes={allCategoriesTypes} categories={categories} />
		</section>
	)
}

const MemoDishesTypes = memo(DishesTypes)
export default MemoDishesTypes
