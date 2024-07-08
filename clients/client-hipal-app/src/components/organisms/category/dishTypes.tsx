import MainTypes from "@/components/molecules/categoryTypes/mainTypes"
import SubTypes from "@/components/molecules/categoryTypes/subTypes"
import { useDishTypes } from "@/components/store/useDishTypes"
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
		<>
			<MainTypes allCategoriesTypes={allCategoriesTypes}/>
			<SubTypes allCategoriesTypes={allCategoriesTypes} categories={categories} />
		</>
	)
}

const MemoDishesTypes = memo(DishesTypes)
export default MemoDishesTypes
