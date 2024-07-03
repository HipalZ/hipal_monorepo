import MainTypes from "@/components/molecules/categoryTypes/mainTypes"
import SubTypes from "@/components/molecules/categoryTypes/subTypes"
import { useDishTypes } from "@/components/store/useDishTypes"
import { ICategory } from "@/components/types/businessData"
import { memo, useEffect, useMemo } from "react"

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
	const setActiveDishTypes = useDishTypes((s) => s.setActiveDishTypes)
	const activeDishTypes = useDishTypes((s) => s.activeDishTypes)
	const mainTypes = useMemo(() => allCategoriesTypes?.main, [allCategoriesTypes?.main])
	const subTypes = useMemo(() => allCategoriesTypes?.sub, [allCategoriesTypes?.sub])

	useEffect(() => {
		if (
			!activeDishTypes.activeMainType &&
			!activeDishTypes.activeSubType &&
			window &&
			!window.location.href.includes("#")
		) {
			const activeMainType = Object.keys(mainTypes || {})?.[0] || null
			const activeSubType = Object.keys(subTypes?.[activeMainType || ""] || {})?.[0] || null

			setActiveDishTypes({
				activeMainType: activeMainType,
				activeSubType: activeSubType,
			})
		}
	}, [allCategoriesTypes])

	return (
		<>
			<MainTypes allCategoriesTypes={allCategoriesTypes}/>
			<SubTypes allCategoriesTypes={allCategoriesTypes} categories={categories} />
		</>
	)
}

const MemoDishesTypes = memo(DishesTypes)
export default MemoDishesTypes
