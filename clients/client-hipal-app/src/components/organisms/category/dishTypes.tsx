import MainTypes from "@/components/molecules/categoryTypes/mainTypes"
import SubTypes from "@/components/molecules/categoryTypes/subTypes"
import { useDishTypes } from "@/components/store/useDishTypes"
import { memo, useEffect, useMemo } from "react"

function DishesTypes({
	allCategoriesTypes: allCategories,
}: {
	allCategoriesTypes: {
		main: any
		sub: any
	}
}) {
	const setActiveDishTypes = useDishTypes((s) => s.setActiveDishTypes)
	const activeDishTypes = useDishTypes((s) => s.activeDishTypes)
	const allCategoriesTypes = useMemo(() => allCategories, [allCategories])
	const mainTypes = useMemo(() => allCategories?.main, [allCategories?.main])
	const subTypes = useMemo(() => allCategories?.sub, [allCategories?.sub])

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
	}, [allCategories])

	return (
		<div className="flex flex-col w-full">
			<MainTypes />
			<SubTypes />
		</div>
	)
}

export default memo(DishesTypes)
